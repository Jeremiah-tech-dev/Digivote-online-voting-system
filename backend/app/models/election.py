from app import db
from datetime import datetime

class Election(db.Model):
    __tablename__ = 'elections'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    election_type = db.Column(db.String(50), nullable=False)  # Presidential, Parliamentary, County
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), default='upcoming')  # upcoming, active, completed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    candidates = db.relationship('Candidate', backref='election', lazy=True, cascade='all, delete-orphan')
    votes = db.relationship('Vote', backref='election', lazy=True, cascade='all, delete-orphan')
    
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


class Candidate(db.Model):
    __tablename__ = 'candidates'
    
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    party = db.Column(db.String(100), nullable=False)
    position = db.Column(db.String(100), nullable=False)
    election_id = db.Column(db.Integer, db.ForeignKey('elections.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship
    votes = db.relationship('Vote', backref='candidate', lazy=True)
    
    def to_dict(self):
        """Convert candidate to dictionary"""
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'party': self.party,
            'position': self.position,
            'election_id': self.election_id
        }
