from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Dictionary of Kenyan counties
KENYAN_COUNTIES = {
    'nairobi': ['Westlands', 'Dagoretti', 'Langata', 'Kibra', 'Roysambu'],
    'mombasa': ['Changamwe', 'Jomvu', 'Kisauni', 'Nyali', 'Likoni'],
    'kisumu': ['Kisumu East', 'Kisumu West', 'Kisumu Central', 'Seme', 'Nyando'],
    'nakuru': ['Nakuru Town East', 'Nakuru Town West', 'Gilgil', 'Naivasha', 'Molo']
}

# List of valid genders
VALID_GENDERS = ['male', 'female', 'other']

# Tuple of election types
ELECTION_TYPES = ('Presidential', 'Parliamentary', 'County', 'Senatorial', 'Gubernatorial')

def hash_password(password):
    """Hash a password using passlib"""
    return pwd_context.hash(password)

def verify_password(password_hash, password):
    """Verify a password against its hash"""
    return pwd_context.verify(password, password_hash)

def validate_voter_data(data):
    """Validate voter registration data using dict"""
    required_fields = [
        'firstName', 'lastName', 'nationalId', 'dateOfBirth',
        'phoneNumber', 'email', 'gender', 'county', 'constituency',
        'ward', 'pollingStation', 'password'
    ]
    
    errors = []
    for field in required_fields:
        if field not in data or not data[field]:
            errors.append(f"{field} is required")
    
    return {'valid': len(errors) == 0, 'errors': errors}

def get_voter_location_tuple(voter):
    """Return voter location as tuple"""
    return (voter.county, voter.constituency, voter.ward, voter.polling_station)

def format_voter_info(voter):
    """Format voter information as dictionary"""
    return {
        'name': f"{voter.first_name} {voter.last_name}",
        'location': get_voter_location_tuple(voter),
        'contact': [voter.phone_number, voter.email]
    }
