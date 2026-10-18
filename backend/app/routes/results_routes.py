from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from app.auth import get_current_admin
from app.database import get_db
from app.models.vote import Vote
from app.models.election import Candidate

router = APIRouter()

@router.get('/results')
def get_results(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    """Vote totals for every candidate - admin only"""
    results = db.query(
        Candidate.first_name,
        Candidate.last_name,
        Candidate.party,
        Candidate.position,
        Candidate.county,
        func.count(Vote.id).label('vote_count')
    ).outerjoin(Vote, Vote.candidate_id == Candidate.id)\
     .group_by(Candidate.id)\
     .order_by(
         case(
             (Candidate.position == 'Presidential', 0),
             (Candidate.position == 'Governor', 1),
             (Candidate.position == 'Senator', 2),
             else_=3
         ),
         Candidate.county,
         func.count(Vote.id).desc()
     )\
     .all()
    
    results_list = [{
        'candidate_name': f"{r.first_name} {r.last_name}",
        'party': r.party,
        'position': r.position,
        'county': r.county,
        'vote_count': r.vote_count
    } for r in results]
    
    return {'results': results_list}
