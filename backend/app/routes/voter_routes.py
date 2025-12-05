from flask import Blueprint, request, jsonify
from app import db
from app.models.voter import Voter
from app.utils.helpers import hash_password, verify_password, validate_voter_data
from datetime import datetime

bp = Blueprint('voters', __name__, url_prefix='/api')

@bp.route('/register', methods=['POST'])
def register_voter():
    data = request.json
    
    # Validate data
    validation = validate_voter_data(data)
    if not validation['valid']:
        return jsonify({'error': 'Validation failed', 'details': validation['errors']}), 400
    
    # Check if national ID already exists
    existing_voter = Voter.query.filter_by(national_id_number=data['nationalId']).first()
    if existing_voter:
        return jsonify({'error': 'National ID already registered'}), 400
    
    # Create new voter
    new_voter = Voter(
        first_name=data['firstName'],
        last_name=data['lastName'],
        national_id_number=data['nationalId'],
        date_of_birth=datetime.strptime(data['dateOfBirth'], '%Y-%m-%d').date(),
        phone_number=data['phoneNumber'],
        email=data['email'],
        gender=data['gender'],
        physical_address=data.get('address', ''),
        county=data['county'],
        constituency=data['constituency'],
        ward=data['ward'],
        polling_station=data['pollingStation'],
        password_hash=hash_password(data['password'])
    )
    
    db.session.add(new_voter)
    db.session.commit()
    
    return jsonify({
        'message': 'Registration successful',
        'voter_id': new_voter.id,
        'voter': new_voter.to_dict()
    }), 201

@bp.route('/verify', methods=['POST'])
def verify_voter():
    data = request.json
    voter = Voter.query.filter_by(national_id_number=data['idNumber']).first()
    
    if not voter:
        return jsonify({'error': 'Voter not found'}), 404
    
    # Check year of birth
    if voter.date_of_birth.year != int(data['yearOfBirth']):
        return jsonify({'error': 'Invalid year of birth'}), 400
    
    # Get full name as tuple
    first_name, last_name = voter.get_full_name()
    
    return jsonify({
        'message': 'Verification successful',
        'voter': {
            'name': f"{first_name} {last_name}",
            'county': voter.county,
            'constituency': voter.constituency,
            'ward': voter.ward,
            'polling_station': voter.polling_station
        }
    }), 200

@bp.route('/login', methods=['POST'])
def login_voter():
    data = request.json
    voter = Voter.query.filter_by(national_id_number=data['nationalId']).first()
    
    if not voter:
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # Verify password
    if not verify_password(voter.password_hash, data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # Check if voter has already voted
    if voter.has_voted:
        return jsonify({'error': 'You have already voted in this election.'}), 403
    
    return jsonify({
        'message': 'Login successful',
        'voter': voter.to_dict()
    }), 200

@bp.route('/voters', methods=['GET'])
def get_all_voters():
    """Get all voters - returns list"""
    voters = Voter.query.all()
    voters_list = [voter.to_dict() for voter in voters]
    return jsonify({'voters': voters_list, 'count': len(voters_list)}), 200

@bp.route('/voters/<int:voter_id>', methods=['GET'])
def get_voter(voter_id):
    voter = Voter.query.get(voter_id)
    if not voter:
        return jsonify({'error': 'Voter not found'}), 404
    return jsonify(voter.to_dict()), 200

@bp.route('/voters/<int:voter_id>/mark-voted', methods=['PUT'])
def mark_voter_as_voted(voter_id):
    voter = Voter.query.get(voter_id)
    if not voter:
        return jsonify({'error': 'Voter not found'}), 404
    
    voter.has_voted = True
    db.session.commit()
    return jsonify({'message': 'Voter marked as voted'}), 200
