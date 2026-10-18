from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from app.auth import get_current_admin
from app.database import get_db
from app.models.vote import Vote, VoterParticipation
from app.models.voter import Voter
from app.models.election import Candidate, Election

router = APIRouter()

@router.get('/results')
def get_results(election_id: int = 1, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    """Vote totals for every candidate, plus turnout - admin only"""
    election = db.query(Election).filter(Election.id == election_id).first()
    if not election:
        raise HTTPException(status_code=404, detail='Election not found')

    results = db.query(
        Candidate.id,
        Candidate.first_name,
        Candidate.last_name,
        Candidate.party,
        Candidate.position,
        Candidate.county,
        func.count(Vote.id).label('vote_count')
    ).outerjoin(Vote, Vote.candidate_id == Candidate.id)\
     .filter(Candidate.election_id == election.id)\
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
        'candidate_id': r.id,
        'candidate_name': f"{r.first_name} {r.last_name}",
        'party': r.party,
        'position': r.position,
        'county': r.county,
        'vote_count': r.vote_count
    } for r in results]

    registered_voters = db.query(Voter).count()
    ballots_cast = db.query(VoterParticipation).filter(VoterParticipation.election_id == election.id).count()

    # Registered voters and turnout per county
    county_rows = db.query(Voter.county, func.count(Voter.id)).group_by(Voter.county).all()
    voted_rows = db.query(Voter.county, func.count(VoterParticipation.id))\
        .join(VoterParticipation, VoterParticipation.voter_id == Voter.id)\
        .filter(VoterParticipation.election_id == election.id)\
        .group_by(Voter.county).all()
    voted_by_county = dict(voted_rows)
    turnout_by_county = [{
        'county': county,
        'registered': registered,
        'voted': voted_by_county.get(county, 0)
    } for county, registered in sorted(county_rows)]

    # Ballots cast per hour (running total) - only aggregate counts, no individual voters
    times = sorted(t for (t,) in db.query(VoterParticipation.voted_at)
                   .filter(VoterParticipation.election_id == election.id).all() if t)
    timeline = []
    running_total = 0
    for voted_at in times:
        hour = voted_at.replace(minute=0, second=0, microsecond=0).isoformat()
        running_total += 1
        if timeline and timeline[-1]['hour'] == hour:
            timeline[-1]['ballots'] += 1
            timeline[-1]['cumulative'] = running_total
        else:
            timeline.append({'hour': hour, 'ballots': 1, 'cumulative': running_total})

    return {
        'election': election.to_dict(),
        'turnout_timeline': timeline,
        'summary': {
            'registered_voters': registered_voters,
            'ballots_cast': ballots_cast,
            'turnout_percent': round(ballots_cast * 100 / registered_voters, 1) if registered_voters else 0
        },
        'turnout_by_county': turnout_by_county,
        'results': results_list
    }
