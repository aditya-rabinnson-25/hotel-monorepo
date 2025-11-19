from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from typing import Optional
import os

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

def create_access_token(subject: dict, minutes: Optional[int] = None) -> str:
    """Create JWT access token"""
    exp_min = minutes or ACCESS_TOKEN_EXPIRE_MINUTES
    now = datetime.now(timezone.utc)
    
    payload = {
        "sub": subject.get("sub"),
        "role": subject.get("role"),
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=exp_min)).timestamp()),
    }
    
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> Optional[dict]:
    """Decode JWT token"""
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None
    
def decode_access_token(token: str):
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

