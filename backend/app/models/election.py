from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Election(Base):
    __tablename__ = 'elections'
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    election_type = Column(String(50), nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    status = Column(String(20), default='upcoming')  # upcoming -> active -> closed
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    candidates = relationship('Candidate', back_populates='election', cascade='all, delete-orphan')
    votes = relationship('Vote', back_populates='election', cascade='all, delete-orphan')
    
    def to_dict(self):
        """Convert election to dictionary"""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'election_type': self.election_type,
            'start_date': self.start_date.isoformat(),
            'end_date': self.end_date.isoformat(),
            'status': self.status
        }
    
    def get_candidates_list(self):
        """Return list of candidate names"""
        return [f"{c.first_name} {c.last_name}" for c in self.candidates]


class Candidate(Base):
    __tablename__ = 'candidates'
    
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    party = Column(String(100), nullable=False)
    position = Column(String(100), nullable=False)
    county = Column(String(100))
    image_url = Column(String(500))
    party_logo_url = Column(String(500))
    election_id = Column(Integer, ForeignKey('elections.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    election = relationship('Election', back_populates='candidates')
    votes = relationship('Vote', back_populates='candidate')
    
    def to_dict(self):
        """Convert candidate to dictionary"""
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'party': self.party,
            'position': self.position,
            'county': self.county,
            'image_url': self.image_url,
            'party_logo_url': self.party_logo_url,
            'election_id': self.election_id
        }
