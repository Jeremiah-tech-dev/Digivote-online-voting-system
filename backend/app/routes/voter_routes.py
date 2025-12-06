from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.voter import Voter
from app.utils.helpers import hash_password, verify_password, validate_voter_data
from datetime import datetime
from pydantic import BaseModel

router = APIRouter()

class VoterRegister(BaseModel):
    firstName: str
    lastName: str
    nationalId: str
    dateOfBirth: str
    phoneNumber: str
    email: str
    gender: str
    address: str = ""
    county: str
    constituency: str
    ward: str
    pollingStation: str
    password: str

class VoterVerify(BaseModel):
    idNumber: str
    yearOfBirth: str

class VoterLogin(BaseModel):
    nationalId: str
    password: str

@router.post('/register')
def register_voter(data: VoterRegister, db: Session = Depends(get_db)):
    # Validate data
    validation = validate_voter_data(data.dict())
    if not validation['valid']:
        raise HTTPException(status_code=400, detail='Validation failed: ' + ', '.join(validation['errors']))
    
    # Check if national ID already exists
    existing_voter = db.query(Voter).filter(Voter.national_id_number == data.nationalId).first()
    if existing_voter:
        raise HTTPException(status_code=400, detail='National ID already registered')
    
    # Create new voter
    new_voter = Voter(
        first_name=data.firstName,
        last_name=data.lastName,
        national_id_number=data.nationalId,
        date_of_birth=datetime.strptime(data.dateOfBirth, '%Y-%m-%d').date(),
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
    db.commit()
    db.refresh(new_voter)
    
    return {
        'message': 'Registration successful',
        'voter_id': new_voter.id,
        'voter': new_voter.to_dict()
    }

@router.post('/verify')
def verify_voter(data: VoterVerify, db: Session = Depends(get_db)):
    voter = db.query(Voter).filter(Voter.national_id_number == data.idNumber).first()
    
    if not voter:
        raise HTTPException(status_code=404, detail='Voter not found')
    
    # Check year of birth
    if voter.date_of_birth.year != int(data.yearOfBirth):
        raise HTTPException(status_code=400, detail='Invalid year of birth')
    
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
    voter = db.query(Voter).filter(Voter.national_id_number == data.nationalId).first()
    
    if not voter:
        raise HTTPException(status_code=401, detail='Invalid credentials')
    
    # Verify password
    if not verify_password(voter.password_hash, data.password):
        raise HTTPException(status_code=401, detail='Invalid credentials')
    
    # Check if voter has already voted
    if voter.has_voted:
        raise HTTPException(status_code=403, detail='You have already voted in this election.')
    
    return {
        'message': 'Login successful',
        'voter': voter.to_dict()
    }

@router.get('/voters')
def get_all_voters(db: Session = Depends(get_db)):
    """Get all voters - returns list"""
    voters = db.query(Voter).all()
    voters_list = [voter.to_dict() for voter in voters]
    return {'voters': voters_list, 'count': len(voters_list)}

@router.get('/voters/{voter_id}')
def get_voter(voter_id: int, db: Session = Depends(get_db)):
    voter = db.query(Voter).filter(Voter.id == voter_id).first()
    if not voter:
        raise HTTPException(status_code=404, detail='Voter not found')
    return voter.to_dict()

@router.put('/voters/{voter_id}/mark-voted')
def mark_voter_as_voted(voter_id: int, db: Session = Depends(get_db)):
    voter = db.query(Voter).filter(Voter.id == voter_id).first()
    if not voter:
        raise HTTPException(status_code=404, detail='Voter not found')
    
    voter.has_voted = True
    db.commit()
    return {'message': 'Voter marked as voted'}
