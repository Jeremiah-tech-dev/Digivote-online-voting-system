import secrets
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.auth import get_current_voter
from app.database import get_db
from app.models.audit_log import record_audit
from app.models.election import Candidate, Election
from app.models.vote import Vote, VoterParticipation
from app.models.voter import Voter
from app.schemas import BallotSubmit
from app.utils.helpers import generate_receipt_code

router = APIRouter()


@router.post('/votes', status_code=201)
def cast_ballot(data: BallotSubmit, voter: Voter = Depends(get_current_voter), db: Session = Depends(get_db)):
    """Cast a complete ballot (President, Governor, Senator) in one transaction.
    The voter comes from the login token, never from the request body."""
    election = db.query(Election).filter(Election.id == data.election_id).first()
    if not election:
        raise HTTPException(status_code=404, detail='Election not found')
    if election.status != 'active':
        raise HTTPException(status_code=403, detail='Voting is not open for this election')

    if voter.has_voted:
        raise HTTPException(status_code=409, detail='You have already voted in this election.')

    # Position each selected candidate must hold, and whether they must be from the voter's county
    selections = [
        (data.presidential_id, 'Presidential', False),
        (data.governor_id, 'Governor', True),
        (data.senator_id, 'Senator', True),
    ]

    receipt_code = generate_receipt_code()

    for candidate_id, position, county_level in selections:
        candidate = db.query(Candidate).filter(
            Candidate.id == candidate_id,
            Candidate.election_id == election.id
        ).first()
        if not candidate or candidate.position != position:
            raise HTTPException(status_code=400, detail=f'Invalid {position.lower()} candidate')
        if county_level and candidate.county != voter.county:
            raise HTTPException(status_code=400, detail=f'You can only vote for a {position.lower()} in {voter.county}')

        # Note: no voter_id and no timestamp - the vote can't be traced back to the voter
        db.add(Vote(
            id=secrets.token_hex(16),
            ballot_code=receipt_code,
            election_id=election.id,
            candidate_id=candidate.id,
            position=position
        ))

    # Separately record THAT this voter took part
    db.add(VoterParticipation(voter_id=voter.id, election_id=election.id))
    voter.has_voted = True
    record_audit(db, 'ballot_cast', 'voter', voter.national_id_number, f'Election {election.id}')

    # The votes, the participation record and the audit entry are saved together, or not at all.
    try:
        db.commit()
    except IntegrityError:
        # The unique constraint caught a second ballot submitted at the same time
        db.rollback()
        raise HTTPException(status_code=409, detail='You have already voted in this election.')

    return {'message': 'Your ballot has been cast successfully', 'receipt_code': receipt_code}


@router.get('/receipts/{receipt_code}')
def check_receipt(receipt_code: str, db: Session = Depends(get_db)):
    """Lets a voter confirm their ballot was counted.
    It deliberately does NOT reveal who they voted for, so a receipt can't be used
    to prove a vote to someone else (which would allow vote buying or coercion)."""
    code = receipt_code.strip().upper()
    votes = db.query(Vote).filter(Vote.ballot_code == code).all()
    if not votes:
        raise HTTPException(status_code=404, detail='No ballot found with that receipt code')

    election = votes[0].election
    return {
        'counted': True,
        'election': election.title,
        'positions_recorded': sorted(v.position for v in votes)
    }
