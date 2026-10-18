from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Dictionary of Kenyan counties
KENYAN_COUNTIES = {
    'nairobi': ['Westlands', 'Dagoretti', 'Langata', 'Kibra', 'Roysambu'],
    'mombasa': ['Changamwe', 'Jomvu', 'Kisauni', 'Nyali', 'Likoni'],
    'kisumu': ['Kisumu East', 'Kisumu West', 'Kisumu Central', 'Seme', 'Nyando'],
    'nakuru': ['Nakuru Town East', 'Nakuru Town West', 'Gilgil', 'Naivasha', 'Molo']
}

# Counties that have candidates in this election (must match seed data)
VALID_COUNTIES = ('Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret')

# Positions on the ballot, in voting order
BALLOT_POSITIONS = ('Presidential', 'Governor', 'Senator')

# List of valid genders
VALID_GENDERS = ['male', 'female', 'other']

MINIMUM_VOTING_AGE = 18

# Tuple of election types
ELECTION_TYPES = ('Presidential', 'Parliamentary', 'County', 'Senatorial', 'Gubernatorial')

def hash_password(password):
    """Hash a password using passlib"""
    return pwd_context.hash(password)

def verify_password(password_hash, password):
    """Verify a password against its hash"""
    return pwd_context.verify(password, password_hash)

def calculate_age(date_of_birth, today):
    """Age in whole years on the given day"""
    had_birthday = (today.month, today.day) >= (date_of_birth.month, date_of_birth.day)
    return today.year - date_of_birth.year - (0 if had_birthday else 1)

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
