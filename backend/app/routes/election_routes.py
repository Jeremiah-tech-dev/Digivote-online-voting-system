from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.election import Election, Candidate
from app.models.vote import Vote

router = APIRouter()

@router.get('/elections')
def get_elections(db: Session = Depends(get_db)):
    """Get all elections - returns list"""
    elections = db.query(Election).all()
    elections_list = [election.to_dict() for election in elections]
    return {'elections': elections_list}

@router.get('/elections/{election_id}/candidates')
def get_candidates(election_id: int, db: Session = Depends(get_db)):
    """Get candidates for an election"""
    election = db.query(Election).filter(Election.id == election_id).first()
    if not election:
        raise HTTPException(status_code=404, detail="Election not found")
    
    candidates_list = [candidate.to_dict() for candidate in election.candidates]
    return {'candidates': candidates_list}

@router.get('/elections/{election_id}/results')
def get_results(election_id: int, db: Session = Depends(get_db)):
    """Get election results - uses dict and list"""
    election = db.query(Election).filter(Election.id == election_id).first()
    if not election:
        raise HTTPException(status_code=404, detail="Election not found")
    
    # Count votes per candidate
    results = {}
    for candidate in election.candidates:
        vote_count = db.query(Vote).filter(
            Vote.election_id == election_id,
            Vote.candidate_id == candidate.id
        ).count()
        
        results[candidate.id] = {
            'candidate_name': f"{candidate.first_name} {candidate.last_name}",
            'party': candidate.party,
            'votes': vote_count
        }
    
    total_votes = db.query(Vote).filter(Vote.election_id == election_id).count()
    
    return {
        'election': election.to_dict(),
        'results': results,
        'total_votes': total_votes
    }
