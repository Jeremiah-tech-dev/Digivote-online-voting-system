from app import db
from datetime import datetime

class Voter(db.Model):
    __tablename__ = 'voters'
    
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    national_id_number = db.Column(db.String(50), unique=True, nullable=False)
    date_of_birth = db.Column(db.Date, nullable=False)
    phone_number = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    physical_address = db.Column(db.String(255))
    county = db.Column(db.String(100), nullable=False)
    constituency = db.Column(db.String(100), nullable=False)
    ward = db.Column(db.String(100), nullable=False)
    polling_station = db.Column(db.String(100), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    has_voted = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    votes = db.relationship('Vote', backref='voter', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        """Convert voter object to dictionary"""
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'national_id_number': self.national_id_number,
            'county': self.county,
            'constituency': self.constituency,
            'ward': self.ward,
            'polling_station': self.polling_station,
            'has_voted': self.has_voted
        }
    
    def get_full_name(self):
        """Return full name as tuple"""
        return (self.first_name, self.last_name)
