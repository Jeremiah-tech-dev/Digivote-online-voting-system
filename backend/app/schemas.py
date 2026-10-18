import re
from datetime import date

from pydantic import BaseModel, field_validator

from app.utils.helpers import MINIMUM_VOTING_AGE, VALID_COUNTIES, VALID_GENDERS, calculate_age

NATIONAL_ID_PATTERN = re.compile(r'^\d{7,8}$')
# Kenyan mobile numbers: 07XXXXXXXX, 01XXXXXXXX or +2547XXXXXXXX / +2541XXXXXXXX
PHONE_PATTERN = re.compile(r'^(?:\+254|0)[17]\d{8}$')
EMAIL_PATTERN = re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]+$')
NAME_PATTERN = re.compile(r"^[A-Za-z][A-Za-z' -]{0,99}$")


def _required_text(value, field_name, max_length=100):
    value = value.strip()
    if not value:
        raise ValueError(f'{field_name} is required')
    if len(value) > max_length:
        raise ValueError(f'{field_name} must be at most {max_length} characters')
    return value


class VoterRegister(BaseModel):
    firstName: str
    lastName: str
    nationalId: str
    dateOfBirth: date
    phoneNumber: str
    email: str
    gender: str
    address: str = ""
    county: str
    constituency: str
    ward: str
    pollingStation: str
    password: str

    @field_validator('firstName', 'lastName')
    @classmethod
    def validate_name(cls, value):
        value = value.strip()
        if not NAME_PATTERN.match(value):
            raise ValueError('Names may only contain letters, spaces, hyphens and apostrophes')
        return value

    @field_validator('nationalId')
    @classmethod
    def validate_national_id(cls, value):
        value = value.strip()
        if not NATIONAL_ID_PATTERN.match(value):
            raise ValueError('National ID must be 7 or 8 digits')
        return value

    @field_validator('dateOfBirth')
    @classmethod
    def validate_age(cls, value):
        today = date.today()
        if value > today:
            raise ValueError('Date of birth cannot be in the future')
        if calculate_age(value, today) < MINIMUM_VOTING_AGE:
            raise ValueError(f'You must be at least {MINIMUM_VOTING_AGE} years old to register')
        if calculate_age(value, today) > 120:
            raise ValueError('Please enter a valid date of birth')
        return value

    @field_validator('phoneNumber')
    @classmethod
    def validate_phone(cls, value):
        value = value.replace(' ', '').strip()
        if not PHONE_PATTERN.match(value):
            raise ValueError('Phone number must be a valid Kenyan number, e.g. 0712345678 or +254712345678')
        return value

    @field_validator('email')
    @classmethod
    def validate_email(cls, value):
        value = value.strip().lower()
        if len(value) > 120 or not EMAIL_PATTERN.match(value):
            raise ValueError('Please enter a valid email address')
        return value

    @field_validator('gender')
    @classmethod
    def validate_gender(cls, value):
        value = value.strip().lower()
        if value not in VALID_GENDERS:
            raise ValueError('Please select a valid gender')
        return value

    @field_validator('address')
    @classmethod
    def validate_address(cls, value):
        value = value.strip()
        if len(value) > 255:
            raise ValueError('Address must be at most 255 characters')
        return value

    @field_validator('county')
    @classmethod
    def validate_county(cls, value):
        value = value.strip()
        if value not in VALID_COUNTIES:
            raise ValueError(f"County must be one of: {', '.join(VALID_COUNTIES)}")
        return value

    @field_validator('constituency')
    @classmethod
    def validate_constituency(cls, value):
        return _required_text(value, 'Constituency')

    @field_validator('ward')
    @classmethod
    def validate_ward(cls, value):
        return _required_text(value, 'Ward')

    @field_validator('pollingStation')
    @classmethod
    def validate_polling_station(cls, value):
        return _required_text(value, 'Polling station')

    @field_validator('password')
    @classmethod
    def validate_password(cls, value):
        if len(value) < 8:
            raise ValueError('Password must be at least 8 characters')
        if len(value.encode('utf-8')) > 72:
            raise ValueError('Password must be at most 72 characters')
        if not re.search(r'[A-Za-z]', value) or not re.search(r'\d', value):
            raise ValueError('Password must contain at least one letter and one number')
        return value


class VoterVerify(BaseModel):
    idNumber: str
    yearOfBirth: int

    @field_validator('idNumber')
    @classmethod
    def validate_national_id(cls, value):
        value = value.strip()
        if not NATIONAL_ID_PATTERN.match(value):
            raise ValueError('National ID must be 7 or 8 digits')
        return value


class VoterLogin(BaseModel):
    nationalId: str
    password: str


class AdminLogin(BaseModel):
    username: str
    password: str


class BallotSubmit(BaseModel):
    """A complete ballot: one candidate for each position"""
    presidential_id: int
    governor_id: int
    senator_id: int
    election_id: int = 1
