from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

# Ballot secrecy: WHO voted and WHAT they voted for are stored in two separate tables
# with nothing linking them.
#   - VoterParticipation records that a voter took part (used to stop double voting)
#   - Vote records a choice, with no voter ID and no timestamp, so a vote can't be
#     matched back to a voter by ID or by time.

class VoterParticipation(Base):
    __tablename__ = 'voter_participation'
    # The database guarantees one ballot per voter per election,
    # even if two requests arrive at the same time.
    __table_args__ = (
        UniqueConstraint('voter_id', 'election_id', name='uq_one_ballot_per_voter'),
    )

    id = Column(Integer, primary_key=True, index=True)
    voter_id = Column(Integer, ForeignKey('voters.id'), nullable=False)
    election_id = Column(Integer, ForeignKey('elections.id'), nullable=False)
    voted_at = Column(DateTime, default=datetime.utcnow)

    voter = relationship('Voter', back_populates='participations')


class Vote(Base):
    __tablename__ = 'votes'

    # Random ID (not 1, 2, 3...) so the order of rows doesn't reveal the order of voters
    id = Column(String(32), primary_key=True)
    # Shared by the votes of one ballot; given to the voter as their receipt code
    ballot_code = Column(String(20), nullable=False, index=True)
    election_id = Column(Integer, ForeignKey('elections.id'), nullable=False)
    candidate_id = Column(Integer, ForeignKey('candidates.id'), nullable=False)
    position = Column(String(100), nullable=False)

    # Relationships
    election = relationship('Election', back_populates='votes')
    candidate = relationship('Candidate', back_populates='votes')

    def to_dict(self):
        """Convert vote to dictionary"""
        return {
            'id': self.id,
            'election_id': self.election_id,
            'candidate_id': self.candidate_id,
            'position': self.position
        }
