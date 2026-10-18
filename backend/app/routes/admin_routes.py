from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import config
from app.auth import create_access_token, get_current_admin
from app.database import get_db
from app.models.admin import Admin
from app.schemas import AdminLogin
from app.utils.helpers import verify_password

router = APIRouter()

@router.post('/admin/login')
def login_admin(data: AdminLogin, db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.username == data.username.strip()).first()

    if not admin or not verify_password(admin.password_hash, data.password):
        raise HTTPException(status_code=401, detail='Invalid username or password')

    token = create_access_token(admin.id, 'admin', config.ADMIN_TOKEN_EXPIRE_MINUTES)
    return {
        'message': 'Login successful',
        'access_token': token,
        'token_type': 'bearer',
        'admin': admin.to_dict()
    }

@router.get('/admin/me')
def get_admin_details(admin: Admin = Depends(get_current_admin)):
    return admin.to_dict()
