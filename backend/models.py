from sqlalchemy import Column, Integer, String, DateTime, Boolean, Enum
from sqlalchemy.sql import func
from database import Base
from enum import Enum as PyEnum
from datetime import datetime


class UserRole(str, PyEnum):
    admin = "admin"
    teacher = "teacher"
    student = "student"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(120), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    role = Column(Enum(UserRole), default=UserRole.student, nullable=False)
    is_active = Column(Boolean, default=True)
    is_online = Column(Boolean, default=False)
    webauthn_credential_id = Column(String(512), unique=True, nullable=True)
    webauthn_public_key = Column(String(2048), nullable=True)
    webauthn_sign_count = Column(Integer, default=0)
    webauthn_enabled = Column(Boolean, default=False)
    last_seen = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class AttendanceRecord(Base):
    __tablename__ = "attendance_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    student_name = Column(String(255), nullable=True)
    check_in_time = Column(DateTime(timezone=True), server_default=func.now())
    check_out_time = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(50), default="present")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
