from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from sqlalchemy import JSON
from packages.database.database import Base  # Changed from .database

# ✅ ROLES TABLE
class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String)
    permissions = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    users = relationship("User", back_populates="role")
    admins = relationship("Admin", back_populates="role")

# ✅ ADMINS TABLE
class Admin(Base):
    __tablename__ = "admins"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String, nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    role = relationship("Role", back_populates="admins")

# ✅ HOTELS TABLE
class Hotel(Base):
    __tablename__ = "hotels"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    address = Column(String)
    owner_id = Column(Integer, ForeignKey("users.id"))
    kyc_status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Specify foreign_keys to resolve ambiguity
    owner = relationship("User", foreign_keys=[owner_id], back_populates="owned_hotels")
    employees = relationship("Employee", back_populates="hotel")

# ✅ USERS TABLE
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True)
    phone = Column(String)
    password_hash = Column(String, nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"))
    hotel_id = Column(Integer, ForeignKey("hotels.id"))
    status = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    role = relationship("Role", back_populates="users")
    # Specify foreign_keys to resolve ambiguity
    hotel = relationship("Hotel", foreign_keys=[hotel_id])
    owned_hotels = relationship("Hotel", foreign_keys="Hotel.owner_id", back_populates="owner")
    employees = relationship("Employee", back_populates="user")

# ✅ EMPLOYEES TABLE
class Employee(Base):
    __tablename__ = "employees"
    id = Column(Integer, primary_key=True, index=True)
    hotel_id = Column(Integer, ForeignKey("hotels.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    designation = Column(String)
    shift_timing = Column(String)
    status = Column(Boolean, default=True)
    
    hotel = relationship("Hotel", back_populates="employees")
    user = relationship("User", back_populates="employees")


# Session audit (app-level, not Better Auth’s internal)
class AppSession(Base):
    __tablename__ = "app_sessions"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    user_agent = Column(Text)
    ip_address = Column(String(64))
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    revoked = Column(Boolean, default=False)

class Device(Base):
    __tablename__ = "devices"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    device_id = Column(String(128), index=True)        # e.g., fingerprint
    push_token = Column(Text, nullable=True)           # FCM/APNS token
    last_seen_at = Column(DateTime, default=datetime.utcnow)

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    type = Column(String(64))                           # e.g., 'booking_created'
    title = Column(String(200))
    body = Column(Text)
    read_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
