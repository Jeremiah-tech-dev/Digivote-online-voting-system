from flask import Blueprint, jsonify
from app import db
from app.models.vote import Vote
from app.models.election import Candidate
from sqlalchemy import func, case

bp = Blueprint('results', __name__, url_prefix='/api')

@bp.route('/results', methods=['GET'])
def get_results():
    results = db.session.query(
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
    
    return jsonify({'results': results_list}), 200
