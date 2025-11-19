from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# ✅ ROLE SCHEMA
class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None

class RoleCreate(RoleBase):
    permissions: dict = {}

class RoleResponse(RoleBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True  # Changed from orm_mode

class Role(RoleBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# ✅ ADMIN SCHEMA
class AdminBase(BaseModel):
    name: str
    email: EmailStr

class AdminCreate(AdminBase):
    password: str
    role_id: int

class Admin(AdminBase):
    id: int
    role_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# ✅ USER SCHEMA
class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str
    role_id: int
    hotel_id: Optional[int] = None

class UserResponse(UserBase):
    id: int
    status: bool
    
    class Config:
        from_attributes = True

# ✅ AUTH SCHEMAS (NEW - Add these)
class LoginRequest(BaseModel):
    """Schema for login request"""
    email: EmailStr
    password: str

class Token(BaseModel):
    """Schema for token response"""
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    """Schema for token data"""
    sub: Optional[str] = None
    role: Optional[str] = None

# ✅ HOTEL SCHEMA
class HotelBase(BaseModel):
    name: str
    address: Optional[str] = None

class HotelCreate(HotelBase):
    owner_id: int

class HotelResponse(HotelBase):
    id: int
    owner_id: int
    kyc_status: str
    created_at: datetime
    
    class Config:
        from_attributes = True
class HotelCreate(BaseModel):
    name: str
    address: Optional[str] = None
    owner_user_id: Optional[int] = None

class HotelOut(BaseModel):
    id: int
    name: str
    address: Optional[str]
    kyc_status: str
    created_at: datetime
    class Config:
        from_attributes = True

class SessionOut(BaseModel):
    id: int
    user_id: int
    user_agent: Optional[str]
    ip_address: Optional[str]
    created_at: datetime
    expires_at: Optional[datetime]
    revoked: bool
    class Config:
        from_attributes = True

class DeviceOut(BaseModel):
    id: int
    user_id: int
    device_id: str
    push_token: Optional[str]
    last_seen_at: datetime
    class Config:
        from_attributes = True

class NotificationOut(BaseModel):
    id: int
    user_id: int
    type: str
    title: str
    body: str
    read_at: Optional[datetime]
    created_at: datetime
    class Config:
        from_attributes = True

# ✅ EMPLOYEE SCHEMA
class EmployeeBase(BaseModel):
    designation: Optional[str] = None
    shift_timing: Optional[str] = None

class EmployeeCreate(EmployeeBase):
    hotel_id: int
    user_id: int

class EmployeeResponse(EmployeeBase):
    id: int
    hotel_id: int
    user_id: int
    status: bool
    
    class Config:
        from_attributes = True
