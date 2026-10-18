from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app import config
from app.database import get_db
from app.models.admin import Admin
from app.models.voter import Voter

bearer_scheme = HTTPBearer(auto_error=False)


def create_access_token(subject_id, role, expire_minutes):
    """Create a signed JWT that identifies a voter or an admin"""
    now = datetime.now(timezone.utc)
    payload = {
        'sub': str(subject_id),
        'role': role,
        'iat': now,
        'exp': now + timedelta(minutes=expire_minutes),
    }
    return jwt.encode(payload, config.SECRET_KEY, algorithm=config.JWT_ALGORITHM)


def _decode_token(credentials, expected_role):
    if credentials is None:
        raise HTTPException(status_code=401, detail='Not authenticated')

    try:
        payload = jwt.decode(
            credentials.credentials, config.SECRET_KEY, algorithms=[config.JWT_ALGORITHM]
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail='Session expired, please log in again')
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail='Invalid authentication token')

    if payload.get('role') != expected_role:
        raise HTTPException(status_code=403, detail='You do not have access to this resource')

    return int(payload['sub'])


def get_current_voter(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
):
    """Dependency: the voter identified by the request's token"""
    voter_id = _decode_token(credentials, 'voter')
    voter = db.query(Voter).filter(Voter.id == voter_id).first()
    if not voter:
        raise HTTPException(status_code=401, detail='Voter account no longer exists')
    return voter


def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
):
    """Dependency: the admin identified by the request's token"""
    admin_id = _decode_token(credentials, 'admin')
    admin = db.query(Admin).filter(Admin.id == admin_id).first()
    if not admin:
        raise HTTPException(status_code=401, detail='Admin account no longer exists')
    return admin
