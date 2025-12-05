from flask import Blueprint, request, jsonify
from app import db
from app.models.election import Election, Candidate
from app.models.vote import Vote
from app.models.voter import Voter
from datetime import datetime

bp = Blueprint('elections', __name__, url_prefix='/api')

@bp.route('/elections', methods=['GET'])
def get_elections():
    """Get all elections - returns list"""
    elections = Election.query.all()
    elections_list = [election.to_dict() for election in elections]
    return jsonify({'elections': elections_list}), 200

@bp.route('/elections/<int:election_id>/candidates', methods=['GET'])
def get_candidates(election_id):
    """Get candidates for an election"""
    election = Election.query.get_or_404(election_id)
    candidates_list = [candidate.to_dict() for candidate in election.candidates]
    return jsonify({'candidates': candidates_list}), 200

@bp.route('/vote', methods=['POST'])
def cast_vote():
    """Cast a vote"""
    data = request.json
    
    # Check if voter already voted in this election
    existing_vote = Vote.query.filter_by(
        voter_id=data['voter_id'],
        election_id=data['election_id']
    ).first()
    
    if existing_vote:
        return jsonify({'error': 'You have already voted in this election'}), 400
    
    # Create new vote
    new_vote = Vote(
        voter_id=data['voter_id'],
        election_id=data['election_id'],
        candidate_id=data['candidate_id']
    )
    
    db.session.add(new_vote)
    db.session.commit()
    
    return jsonify({
        'message': 'Vote cast successfully',
        'vote': new_vote.to_dict()
    }), 201

@bp.route('/elections/<int:election_id>/results', methods=['GET'])
def get_results(election_id):
    """Get election results - uses dict and list"""
    election = Election.query.get_or_404(election_id)
    
    # Count votes per candidate
    results = {}
    for candidate in election.candidates:
        vote_count = Vote.query.filter_by(
            election_id=election_id,
            candidate_id=candidate.id
        ).count()
        
        results[candidate.id] = {
            'candidate_name': f"{candidate.first_name} {candidate.last_name}",
            'party': candidate.party,
            'votes': vote_count
        }
    
    total_votes = Vote.query.filter_by(election_id=election_id).count()
    
    return jsonify({
        'election': election.to_dict(),
        'results': results,
        'total_votes': total_votes
    }), 200
