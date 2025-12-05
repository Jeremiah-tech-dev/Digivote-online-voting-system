from app import db
from datetime import datetime

class Vote(db.Model):
    __tablename__ = 'votes'
    
    id = db.Column(db.Integer, primary_key=True)
    voter_id = db.Column(db.Integer, db.ForeignKey('voters.id'), nullable=False)
    election_id = db.Column(db.Integer, db.ForeignKey('elections.id'), nullable=False)
    candidate_id = db.Column(db.Integer, db.ForeignKey('candidates.id'), nullable=False)
    voted_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """Convert vote to dictionary"""
        return {
            'id': self.id,
            'voter_id': self.voter_id,
            'election_id': self.election_id,
            'candidate_id': self.candidate_id,
            'voted_at': self.voted_at.isoformat()
        }
