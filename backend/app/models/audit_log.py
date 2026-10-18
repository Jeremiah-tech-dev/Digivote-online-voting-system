from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.database import Base

class AuditLog(Base):
    """A record of security-relevant actions: logins, ballots cast, admin changes.
    Ballot entries record THAT a voter voted, never WHO they voted for."""
    __tablename__ = 'audit_logs'

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String(50), nullable=False, index=True)
    actor_type = Column(String(20), nullable=False)  # 'voter', 'admin' or 'anonymous'
    actor = Column(String(100))  # national ID or admin username
    details = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    def to_dict(self):
        return {
            'id': self.id,
            'action': self.action,
            'actor_type': self.actor_type,
            'actor': self.actor,
            'details': self.details,
            'created_at': self.created_at.isoformat()
        }


def record_audit(db, action, actor_type, actor=None, details=None):
    """Add an audit entry to the current transaction (the caller commits)"""
    db.add(AuditLog(action=action, actor_type=actor_type, actor=actor, details=details))
