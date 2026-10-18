from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import config
from app.auth import create_access_token, get_current_admin
from app.database import get_db
from app.models.admin import Admin
from app.models.audit_log import AuditLog, record_audit
from app.models.election import Candidate, Election
from app.models.vote import Vote
from app.schemas import AdminLogin, CandidateData, ElectionStatusUpdate
from app.utils.helpers import verify_password

router = APIRouter()

# Which status changes are allowed. 'closed' is final so results can't be changed afterwards.
ALLOWED_STATUS_CHANGES = {
    'upcoming': {'active'},
    'active': {'upcoming', 'closed'},
    'closed': set(),
}

@router.post('/admin/login')
def login_admin(data: AdminLogin, db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.username == data.username.strip()).first()

    if not admin or not verify_password(admin.password_hash, data.password):
        record_audit(db, 'admin_login_failed', 'anonymous', data.username.strip()[:100])
        db.commit()
        raise HTTPException(status_code=401, detail='Invalid username or password')

    record_audit(db, 'admin_login', 'admin', admin.username)
    db.commit()

    token = create_access_token(admin.id, 'admin', config.ADMIN_TOKEN_EXPIRE_MINUTES)
    return {
        'message': 'Login successful',
        'access_token': token,
        'token_type': 'bearer',
        'admin': admin.to_dict()
    }

@router.get('/admin/me')
def get_admin_details(admin: Admin = Depends(get_current_admin)):
    return admin.to_dict()


# --- Election control ---------------------------------------------------

def _get_election(db, election_id):
    election = db.query(Election).filter(Election.id == election_id).first()
    if not election:
        raise HTTPException(status_code=404, detail='Election not found')
    return election

@router.put('/admin/elections/{election_id}/status')
def update_election_status(election_id: int, data: ElectionStatusUpdate,
                           db: Session = Depends(get_db), admin: Admin = Depends(get_current_admin)):
    election = _get_election(db, election_id)

    if data.status == election.status:
        return {'message': f'Election is already {election.status}', 'election': election.to_dict()}
    if data.status not in ALLOWED_STATUS_CHANGES[election.status]:
        raise HTTPException(status_code=400, detail=f'Cannot change election from {election.status} to {data.status}')
    if data.status == 'upcoming' and db.query(Vote).filter(Vote.election_id == election.id).count() > 0:
        raise HTTPException(status_code=400, detail='Votes have already been cast; the election can only be closed now')

    old_status = election.status
    election.status = data.status
    record_audit(db, 'election_status_changed', 'admin', admin.username,
                 f'Election {election.id}: {old_status} -> {data.status}')
    db.commit()
    return {'message': f'Election is now {election.status}', 'election': election.to_dict()}


# --- Candidate management -----------------------------------------------

def _ensure_candidates_editable(db, election):
    """Candidates can only change before any votes are cast, otherwise
    results could be altered by editing or removing a candidate."""
    if election.status == 'closed':
        raise HTTPException(status_code=400, detail='The election is closed; candidates can no longer be changed')
    if db.query(Vote).filter(Vote.election_id == election.id).count() > 0:
        raise HTTPException(status_code=400, detail='Votes have already been cast; candidates can no longer be changed')

def _candidate_summary(candidate):
    where = f' ({candidate.county})' if candidate.county else ''
    return f'{candidate.first_name} {candidate.last_name}, {candidate.party}, {candidate.position}{where}'

@router.post('/admin/elections/{election_id}/candidates', status_code=201)
def create_candidate(election_id: int, data: CandidateData,
                     db: Session = Depends(get_db), admin: Admin = Depends(get_current_admin)):
    election = _get_election(db, election_id)
    _ensure_candidates_editable(db, election)

    candidate = Candidate(election_id=election.id, **data.model_dump())
    db.add(candidate)
    record_audit(db, 'candidate_created', 'admin', admin.username, _candidate_summary(candidate))
    db.commit()
    return candidate.to_dict()

@router.put('/admin/candidates/{candidate_id}')
def update_candidate(candidate_id: int, data: CandidateData,
                     db: Session = Depends(get_db), admin: Admin = Depends(get_current_admin)):
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail='Candidate not found')
    _ensure_candidates_editable(db, candidate.election)

    for field, value in data.model_dump().items():
        setattr(candidate, field, value)
    record_audit(db, 'candidate_updated', 'admin', admin.username, _candidate_summary(candidate))
    db.commit()
    return candidate.to_dict()

@router.delete('/admin/candidates/{candidate_id}')
def delete_candidate(candidate_id: int, db: Session = Depends(get_db), admin: Admin = Depends(get_current_admin)):
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail='Candidate not found')
    _ensure_candidates_editable(db, candidate.election)

    record_audit(db, 'candidate_deleted', 'admin', admin.username, _candidate_summary(candidate))
    db.delete(candidate)
    db.commit()
    return {'message': 'Candidate deleted'}


# --- Audit log ------------------------------------------------------------

@router.get('/admin/audit-log')
def get_audit_log(limit: int = 200, db: Session = Depends(get_db), admin: Admin = Depends(get_current_admin)):
    limit = max(1, min(limit, 1000))
    entries = db.query(AuditLog).order_by(AuditLog.id.desc()).limit(limit).all()
    return {'entries': [entry.to_dict() for entry in entries]}
