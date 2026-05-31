from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from models import UserRole


class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: UserRole = UserRole.student


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    is_online: Optional[bool] = None


class UserResponse(UserBase):
    id: int
    is_active: bool
    is_online: bool
    last_seen: datetime
    created_at: datetime
    updated_at: datetime
    webauthn_enabled: bool = False

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class WebAuthnRegisterRequest(BaseModel):
    email: EmailStr
    credential: dict


class WebAuthnLoginRequest(BaseModel):
    email: EmailStr
    credential: dict


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class AttendanceRecordResponse(BaseModel):
    id: int
    user_id: int
    student_name: Optional[str] = None
    check_in_time: datetime
    check_out_time: Optional[datetime] = None
    status: str

    class Config:
        from_attributes = True


class DashboardStats(BaseModel):
    total_online: int
    total_offline: int
    total_students: int
    check_in_percentage: float
