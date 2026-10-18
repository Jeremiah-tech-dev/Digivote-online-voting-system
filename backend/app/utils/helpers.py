import secrets
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

# Election lifecycle: upcoming -> active -> closed (closed is final)
ELECTION_STATUSES = ('upcoming', 'active', 'closed')

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

def generate_receipt_code():
    """A random, hard-to-guess ballot receipt code like 'K7Q2-M9XD-4TPA'"""
    alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'  # no 0/O or 1/I, which are easy to mix up
    raw = ''.join(secrets.choice(alphabet) for _ in range(12))
    return f"{raw[0:4]}-{raw[4:8]}-{raw[8:12]}"
