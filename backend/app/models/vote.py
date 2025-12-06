from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Vote(Base):
    __tablename__ = 'votes'
    
    id = Column(Integer, primary_key=True, index=True)
    voter_id = Column(Integer, ForeignKey('voters.id'), nullable=False)
    election_id = Column(Integer, ForeignKey('elections.id'), nullable=False)
    candidate_id = Column(Integer, ForeignKey('candidates.id'), nullable=False)
    voted_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    voter = relationship('Voter', back_populates='votes')
    election = relationship('Election', back_populates='votes')
    candidate = relationship('Candidate', back_populates='votes')
    
    def to_dict(self):
        """Convert vote to dictionary"""
        return {
            'id': self.id,
            'voter_id': self.voter_id,
            'election_id': self.election_id,
            'candidate_id': self.candidate_id,
            'voted_at': self.voted_at.isoformat()
        }
