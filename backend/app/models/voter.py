from sqlalchemy import Column, Integer, String, Date, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Voter(Base):
    __tablename__ = 'voters'
    
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    national_id_number = Column(String(50), unique=True, nullable=False, index=True)
    date_of_birth = Column(Date, nullable=False)
    phone_number = Column(String(20), nullable=False)
    email = Column(String(120), nullable=False)
    gender = Column(String(10), nullable=False)
    physical_address = Column(String(255))
    county = Column(String(100), nullable=False)
    constituency = Column(String(100), nullable=False)
    ward = Column(String(100), nullable=False)
    polling_station = Column(String(100), nullable=False)
    password_hash = Column(String(255), nullable=False)
    has_voted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship (records THAT the voter voted, not who they voted for)
    participations = relationship('VoterParticipation', back_populates='voter', cascade='all, delete-orphan')
    
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
