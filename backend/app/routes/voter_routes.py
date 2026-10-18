from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app import config
from app.auth import create_access_token, get_current_admin, get_current_voter
from app.database import get_db
from app.models.audit_log import record_audit
from app.models.voter import Voter
from app.schemas import VoterLogin, VoterRegister, VoterVerify
from app.utils.helpers import hash_password, verify_password

router = APIRouter()

@router.post('/register', status_code=201)
def register_voter(data: VoterRegister, db: Session = Depends(get_db)):
    # Check if national ID already exists
    existing_voter = db.query(Voter).filter(Voter.national_id_number == data.nationalId).first()
    if existing_voter:
        raise HTTPException(status_code=400, detail='National ID already registered')

    # Create new voter
    new_voter = Voter(
        first_name=data.firstName,
        last_name=data.lastName,
        national_id_number=data.nationalId,
        date_of_birth=data.dateOfBirth,
        phone_number=data.phoneNumber,
        email=data.email,
        gender=data.gender,
        physical_address=data.address,
        county=data.county,
        constituency=data.constituency,
        ward=data.ward,
        polling_station=data.pollingStation,
        password_hash=hash_password(data.password)
    )

    db.add(new_voter)
    try:
        db.commit()
    except IntegrityError:
        # Two registrations with the same ID arrived at the same time
        db.rollback()
        raise HTTPException(status_code=400, detail='National ID already registered')

    return {'message': 'Registration successful'}

@router.post('/verify')
def verify_voter(data: VoterVerify, db: Session = Depends(get_db)):
    voter = db.query(Voter).filter(Voter.national_id_number == data.idNumber).first()

    # Same message for both cases so the endpoint can't be used to discover registered IDs
    if not voter or voter.date_of_birth.year != data.yearOfBirth:
        raise HTTPException(status_code=404, detail='No voter found with that ID number and year of birth')

    # Get full name as tuple
    first_name, last_name = voter.get_full_name()

    return {
        'message': 'Verification successful',
        'voter': {
            'name': f"{first_name} {last_name}",
            'county': voter.county,
            'constituency': voter.constituency,
            'ward': voter.ward,
            'polling_station': voter.polling_station
        }
    }

@router.post('/login')
def login_voter(data: VoterLogin, db: Session = Depends(get_db)):
    voter = db.query(Voter).filter(Voter.national_id_number == data.nationalId.strip()).first()

    if not voter or not verify_password(voter.password_hash, data.password):
        record_audit(db, 'voter_login_failed', 'anonymous', data.nationalId.strip()[:100])
        db.commit()
        raise HTTPException(status_code=401, detail='Invalid credentials')

    # Check if voter has already voted
    if voter.has_voted:
        raise HTTPException(status_code=403, detail='You have already voted in this election.')

    record_audit(db, 'voter_login', 'voter', voter.national_id_number)
    db.commit()

    token = create_access_token(voter.id, 'voter', config.VOTER_TOKEN_EXPIRE_MINUTES)
    return {
        'message': 'Login successful',
        'access_token': token,
        'token_type': 'bearer',
        'voter': voter.to_dict()
    }

@router.get('/me')
def get_my_details(voter: Voter = Depends(get_current_voter)):
    """The logged-in voter's own details"""
    return voter.to_dict()

@router.get('/stats')
def get_public_stats(db: Session = Depends(get_db)):
    """Aggregate turnout numbers - safe to show publicly"""
    total_voters = db.query(Voter).count()
    voters_voted = db.query(Voter).filter(Voter.has_voted.is_(True)).count()
    return {'total_voters': total_voters, 'voters_voted': voters_voted}

@router.get('/voters')
def get_all_voters(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    """Get all voters - admin only"""
    voters = db.query(Voter).all()
    voters_list = [voter.to_dict() for voter in voters]
    return {'voters': voters_list, 'count': len(voters_list)}

@router.get('/voters/{voter_id}')
def get_voter(voter_id: int, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    voter = db.query(Voter).filter(Voter.id == voter_id).first()
    if not voter:
        raise HTTPException(status_code=404, detail='Voter not found')
    return voter.to_dict()
