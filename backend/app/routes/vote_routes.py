from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.vote import Vote
from pydantic import BaseModel

router = APIRouter()

class VoteCreate(BaseModel):
    voter_id: int
    candidate_id: int
    election_id: int = 1

@router.post('/votes')
def cast_vote(data: VoteCreate, db: Session = Depends(get_db)):
    new_vote = Vote(
        voter_id=data.voter_id,
        candidate_id=data.candidate_id,
        election_id=data.election_id
    )
    
    db.add(new_vote)
    db.commit()
    
    return {'message': 'Vote cast successfully'}
