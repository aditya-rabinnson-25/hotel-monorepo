from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import Callable, Iterable
import os

from packages.database.database import get_db
from packages.database.models import User, Admin, Role
from .core.jwt import decode_token
from fastapi import Request

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
COOKIE_NAME = os.getenv("AUTH_COOKIE_NAME", "access_token")

def get_current_subject(request: Request, token: str | None = Depends(oauth2_scheme)) -> dict:
    # Prefer cookie; fall back to Bearer for tools
    cookie_token = request.cookies.get(COOKIE_NAME)
    raw = cookie_token or token
    payload = decode_token(raw) if raw else None
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or missing token")
    return payload

def get_current_user(db: Session = Depends(get_db), subject: dict = Depends(get_current_subject)) -> User:
    user_id = subject.get("sub")
    # try user first
    user = db.query(User).filter(User.id == int(user_id)).first()
    if user:
        return user
    # else admin
    admin = db.query(Admin).filter(Admin.id == int(user_id)).first()
    if admin:
        # present admin as 'user-like' if needed; otherwise raise for /users/me
        raise HTTPException(status_code=400, detail="Use admin endpoints for admins")
    raise HTTPException(status_code=401, detail="Subject not found")

def require_roles(*allowed: Iterable[str]) -> Callable:
    def checker(subject: dict = Depends(get_current_subject), db: Session = Depends(get_db)):
        role_name = subject.get("role")
        role = db.query(Role).filter(Role.name == role_name).first()
        if not role or role_name not in allowed:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return subject
    return checker
