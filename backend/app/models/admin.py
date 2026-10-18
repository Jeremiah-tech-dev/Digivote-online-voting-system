from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.database import Base

class Admin(Base):
    __tablename__ = 'admins'

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        """Convert admin to dictionary (never includes the password hash)"""
        return {
            'id': self.id,
            'username': self.username
        }
