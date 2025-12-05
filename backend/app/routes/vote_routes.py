from flask import Blueprint, request, jsonify
from app import db
from app.models.vote import Vote
from datetime import datetime

bp = Blueprint('votes', __name__, url_prefix='/api')

@bp.route('/votes', methods=['POST'])
def cast_vote():
    data = request.json
    
    new_vote = Vote(
        voter_id=data['voter_id'],
        candidate_id=data['candidate_id'],
        election_id=1
    )
    
    db.session.add(new_vote)
    db.session.commit()
    
    return jsonify({'message': 'Vote cast successfully'}), 201
