from fastapi import APIRouter, Depends, HTTPException, status, Cookie
from sqlalchemy.orm import Session
from typing import List, Optional
from deps.session import get_current_user_from_better_auth

from packages.database.database import get_db
from packages.database.models import User, Admin
from packages.database.schemas import UserCreate, UserResponse
from core.jwt import decode_token
from core.security import hash_password

router = APIRouter(prefix="/users", tags=["users"])

def get_current_user_id(access_token: Optional[str] = Cookie(None)):
    """Extract user ID and role from JWT cookie"""
    print(f"🔍 Checking authentication cookie...")
    
    if not access_token:
        print(f"❌ No access_token cookie found")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated - no cookie"
        )
    
    print(f"🔐 Cookie found: {access_token[:50]}...")
    
    payload = decode_token(access_token)
    if not payload:
        print(f"❌ Invalid token")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    user_id = payload.get("sub")
    role = payload.get("role")
    
    print(f"✅ Token valid - User ID: {user_id}, Role: {role}")
    
    return user_id, role

@router.get("/me")
def get_current_user(
    user_data: tuple = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get current logged-in user information"""
    user_id, role = user_data
    
    print(f"\n📊 Fetching user info for ID: {user_id}, Role: {role}")
    
    # Check if it's an admin
    if role == "super_admin":
        admin = db.query(Admin).filter(Admin.id == int(user_id)).first()
        if not admin:
            print(f"❌ Admin not found with ID: {user_id}")
            raise HTTPException(status_code=404, detail="Admin not found")
        
        result = {
            "id": admin.id,
            "name": admin.name,
            "email": admin.email,
            "role": role
        }
        print(f"✅ Admin info retrieved: {result}")
        return result
    
    # Otherwise check users table
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        print(f"❌ User not found with ID: {user_id}")
        raise HTTPException(status_code=404, detail="User not found")
    
    result = {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": role
    }
    print(f"✅ User info retrieved: {result}")
    return result

@router.get("/", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db)):
    """Get all users"""
    users = db.query(User).all()
    return users

@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    """Get user by ID"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """Create new user"""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    # Create new user
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        phone=user_data.phone,
        password_hash=hash_password(user_data.password),
        role_id=user_data.role_id,
        hotel_id=user_data.hotel_id
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@router.get("/users/me")
def me(session = Depends(get_current_user_from_better_auth)):
    return {
      "id": session["user"]["id"],
      "email": session["user"]["email"],
      "role": session["organization"]["role"] if session.get("organization") else "member",
    }
