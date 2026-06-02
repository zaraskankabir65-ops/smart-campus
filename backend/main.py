from fastapi import FastAPI, Depends, HTTPException, status, Request, Body
from fastapi.responses import HTMLResponse, StreamingResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime, timedelta
import asyncio
from typing import Optional, List
from passlib.context import CryptContext
from jose import JWTError, jwt
from fastapi.security import HTTPBearer
import base64
import json
import io
import os
from dotenv import load_dotenv
from openpyxl import Workbook
import sys
import os

from database import engine, SessionLocal, get_db, Base
from models import User, UserRole, AttendanceRecord
from schemas import (
    UserCreate, UserResponse, LoginRequest, TokenResponse,
    DashboardStats, AttendanceRecordResponse, UserUpdate
)

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production-🔐")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
webauthn_challenges = {}
log_queues: List[asyncio.Queue] = []

sys.path.append(os.path.dirname(os.path.abspath(__file__)))


async def _publish_log(event: dict):
    # Push event to all connected SSE queues
    remove = []
    for q in list(log_queues):
        try:
            await q.put(event)
        except Exception:
            remove.append(q)
    for q in remove:
        try:
            log_queues.remove(q)
        except ValueError:
            pass

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Smart Campus API", version="1.0.0")

# CORS - Render фронтенд үшін ашық
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*",  # Өндірісте нақты URL-мен ауыстырыңыз
        "https://smart-campus-y14.onrender.com",
        "http://localhost:5173",
        "https://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(
    credentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    return user


async def get_current_user_optional(request: Request, db: Session = Depends(get_db)) -> Optional[User]:
    auth_header = request.headers.get('authorization') or ''
    if not auth_header.lower().startswith('bearer '):
        return None

    token = auth_header.split(' ', 1)[1].strip()
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get('sub')
        if user_id is None:
            return None
    except JWTError:
        return None

    return db.query(User).filter(User.id == user_id).first()


@app.on_event("startup")
async def startup_event():
    db = SessionLocal()
    try:
        Base.metadata.create_all(bind=engine)

        admin_user = db.query(User).filter(User.email == "admin@gmail.com").first()
        if not admin_user:
            hashed_admin_pw = hash_password("AdminPassword123")
            new_admin = User(
                email="admin@gmail.com",
                hashed_password=hashed_admin_pw,
                full_name="Admin",
                role=UserRole.admin,
                is_active=True,
                is_online=False,
            )
            db.add(new_admin)
            print("✅ Admin аккаунт автоматты құрылды: admin@gmail.com")
        else:
            try:
                if not verify_password("AdminPassword123", admin_user.hashed_password):
                    admin_user.hashed_password = hash_password("AdminPassword123")
                    admin_user.full_name = admin_user.full_name or "Admin"
                    admin_user.role = UserRole.admin
                    admin_user.is_active = True
                    db.add(admin_user)
                    print("🔁 Admin пароль жаңартылды: AdminPassword123")
                else:
                    print("✅ Admin аккаунт бар және пароль сәйкес келеді: admin@gmail.com")
            except Exception:
                admin_user.hashed_password = hash_password("AdminPassword123")
                db.add(admin_user)
                print("⚠️ Admin пароль қайта жазылды (қатынау қатесі шешілді)")

        student_user = db.query(User).filter(User.email == "student@gmail.com").first()
        if not student_user:
            hashed_student_pw = hash_password("Wiliwonka2954")
            new_student = User(
                email="student@gmail.com",
                hashed_password=hashed_student_pw,
                full_name="Student",
                role=UserRole.student,
                is_active=True,
                is_online=False,
            )
            db.add(new_student)
            print("✅ Student аккаунт автоматты құрылды: student@gmail.com")
        else:
            print("✅ Student аккаунт бар: student@gmail.com")

        db.commit()

        try:
            conn = engine.connect()
            attendance_columns = conn.execute(text("PRAGMA table_info('attendance_records')")).fetchall()
            attendance_col_names = [row[1] for row in attendance_columns]
            if 'student_name' not in attendance_col_names:
                try:
                    conn.execute(text("ALTER TABLE attendance_records ADD COLUMN student_name VARCHAR(255)"))
                    print('🔧 Added missing column attendance_records.student_name')
                except Exception as _:
                    print('⚠️ Could not add student_name column to attendance_records:', _)

            logs_table = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table' AND name='logs'")).fetchall()
            if not logs_table:
                try:
                    conn.execute(text('''
                        CREATE TABLE IF NOT EXISTS logs (
                            id INTEGER NOT NULL PRIMARY KEY,
                            user_id INTEGER NOT NULL,
                            student_name VARCHAR(255),
                            check_in_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                            check_out_time DATETIME,
                            status VARCHAR(50),
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                        )
                    '''))
                    print('🔧 Created missing logs table')
                except Exception as _:
                    print('⚠️ Could not create logs table:', _)

            user_columns = conn.execute(text("PRAGMA table_info('users')")).fetchall()
            user_col_names = [row[1] for row in user_columns]
            if 'webauthn_credential_id' not in user_col_names:
                try:
                    conn.execute(text("ALTER TABLE users ADD COLUMN webauthn_credential_id VARCHAR(512)"))
                    print('🔧 Added users.webauthn_credential_id')
                except Exception as _:
                    print('⚠️ Could not add users.webauthn_credential_id:', _)
            if 'webauthn_public_key' not in user_col_names:
                try:
                    conn.execute(text("ALTER TABLE users ADD COLUMN webauthn_public_key VARCHAR(2048)"))
                    print('🔧 Added users.webauthn_public_key')
                except Exception as _:
                    print('⚠️ Could not add users.webauthn_public_key:', _)
            if 'webauthn_sign_count' not in user_col_names:
                try:
                    conn.execute(text("ALTER TABLE users ADD COLUMN webauthn_sign_count INTEGER DEFAULT 0"))
                    print('🔧 Added users.webauthn_sign_count')
                except Exception as _:
                    print('⚠️ Could not add users.webauthn_sign_count:', _)
            if 'webauthn_enabled' not in user_col_names:
                try:
                    conn.execute(text("ALTER TABLE users ADD COLUMN webauthn_enabled BOOLEAN DEFAULT 0"))
                    print('🔧 Added users.webauthn_enabled')
                except Exception as _:
                    print('⚠️ Could not add users.webauthn_enabled:', _)
            conn.close()
        except Exception as e:
            print('⚠️ Schema migration checks failed:', e)

    except Exception as e:
        print(f"❌ Startup қатесі: {str(e)}")
        db.rollback()
    finally:
        db.close()


@app.post("/api/auth/register", response_model=TokenResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    hashed_password = hash_password(user_data.password)
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name or user_data.email.split('@')[0].capitalize(),
        role=user_data.role,
        is_active=True,
        is_online=False,
        webauthn_enabled=False,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(data={"sub": new_user.id})
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.from_orm(new_user)
    )


def generate_challenge() -> str:
    raw = os.urandom(32)
    return base64.urlsafe_b64encode(raw).rstrip(b"=").decode('utf-8')


@app.get("/api/auth/webauthn/register-options")
def webauthn_register_options(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    challenge = generate_challenge()
    webauthn_challenges[email] = challenge
    user.last_seen = datetime.utcnow()
    db.commit()

    user_id = base64.urlsafe_b64encode(str(user.id).encode()).rstrip(b"=").decode('utf-8')
    return {
        "challenge": challenge,
        "rp": {"name": "Smart Campus"},
        "user": {
            "id": user_id,
            "name": user.email,
            "displayName": user.full_name or user.email,
        },
        "pubKeyCredParams": [{"type": "public-key", "alg": -7}],
        "timeout": 60000,
        "attestation": "direct",
        "authenticatorSelection": {"userVerification": "preferred"},
    }


@app.post("/api/auth/webauthn/register")
def webauthn_register(request: dict = Body(...), db: Session = Depends(get_db)):
    email = request.get('email')
    credential = request.get('credential')
    if not email or not credential:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing WebAuthn payload")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    client_data_json = base64.urlsafe_b64decode(credential['response']['clientDataJSON'] + '==')
    client_data = json.loads(client_data_json.decode('utf-8'))
    if client_data.get('type') != 'webauthn.create':
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid WebAuthn registration response")

    expected_challenge = webauthn_challenges.get(email)
    if not expected_challenge or client_data.get('challenge') != expected_challenge:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired WebAuthn registration challenge")
    webauthn_challenges.pop(email, None)

    user.webauthn_credential_id = credential.get('rawId')
    user.webauthn_public_key = credential.get('response', {}).get('attestationObject')
    user.webauthn_enabled = True
    user.webauthn_sign_count = 0
    db.commit()
    db.refresh(user)

    return {"success": True, "message": "Biometric registration complete"}


@app.get("/api/auth/webauthn/login-options")
def webauthn_login_options(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user or not user.webauthn_enabled or not user.webauthn_credential_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No biometric credential found")

    challenge = generate_challenge()
    webauthn_challenges[email] = challenge
    user.last_seen = datetime.utcnow()
    db.commit()

    return {
        "challenge": challenge,
        "allowCredentials": [
            {
                "type": "public-key",
                "id": user.webauthn_credential_id,
            }
        ],
        "timeout": 60000,
        "userVerification": "preferred",
    }


@app.post("/api/auth/webauthn/login", response_model=TokenResponse)
def webauthn_login(payload: dict = Body(...), db: Session = Depends(get_db)):
    email = payload.get('email')
    credential = payload.get('credential')
    if not email or not credential:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing WebAuthn login payload")

    user = db.query(User).filter(User.email == email).first()
    if not user or not user.webauthn_enabled or not user.webauthn_credential_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found or biometric not configured")

    if credential.get('id') != user.webauthn_credential_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credential mismatch")

    client_data_json = base64.urlsafe_b64decode(credential['response']['clientDataJSON'] + '==')
    client_data = json.loads(client_data_json.decode('utf-8'))
    if client_data.get('type') != 'webauthn.get':
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid WebAuthn login response")

    expected_challenge = webauthn_challenges.get(email)
    if not expected_challenge or client_data.get('challenge') != expected_challenge:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired WebAuthn login challenge")
    webauthn_challenges.pop(email, None)

    user.is_online = True
    user.updated_at = datetime.utcnow()
    db.commit()

    access_token = create_access_token(data={"sub": user.id})
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.from_orm(user)
    )


@app.post("/api/auth/login", response_model=TokenResponse)
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    user.is_online = True
    user.updated_at = datetime.utcnow()
    db.commit()

    access_token = create_access_token(data={"sub": user.id})
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.from_orm(user)
    )


@app.post("/api/auth/logout")
def logout(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.is_online = False
    current_user.last_seen = datetime.utcnow()
    current_user.updated_at = datetime.utcnow()
    db.commit()
    return {"message": "Successfully logged out"}


@app.get("/api/users/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return UserResponse.from_orm(current_user)


@app.put("/api/users/me", response_model=UserResponse)
def update_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user_update.full_name:
        current_user.full_name = user_update.full_name
    if user_update.is_online is not None:
        current_user.is_online = user_update.is_online

    current_user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(current_user)
    return UserResponse.from_orm(current_user)


@app.get("/api/users", response_model=List[UserResponse])
def get_all_users(
    role: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    query = db.query(User)
    if role:
        query = query.filter(User.role == role)

    users = query.all()
    return [UserResponse.from_orm(u) for u in users]


@app.post("/api/attendance/check-in", response_model=AttendanceRecordResponse)
def check_in(
    student_name: Optional[str] = Body(None),
    email: Optional[str] = Body(None),
    password: Optional[str] = Body(None),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    user = None
    if current_user:
        user = current_user
    elif email and password:
        user = db.query(User).filter(User.email == email).first()
        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
    elif email:
        user = db.query(User).filter(User.email == email).first()
    elif student_name:
        base = f"qr-{int(datetime.utcnow().timestamp())}"
        gen_email = f"{base}@local"
        while db.query(User).filter(User.email == gen_email).first():
            gen_email = f"{base}-{int(datetime.utcnow().timestamp() * 1000)}@local"

        tmp_hashed = hash_password("temporary")
        user = User(
            email=gen_email,
            hashed_password=tmp_hashed,
            full_name=student_name,
            role=UserRole.student,
            is_active=True,
            is_online=False,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email/password or student name required for check-in"
        )

    if student_name and student_name.strip():
        current_full_name = user.full_name or ""
        if current_full_name.strip().lower() != student_name.strip().lower():
            user.full_name = student_name.strip()
            db.add(user)
            db.commit()

    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    existing = db.query(AttendanceRecord).filter(
        AttendanceRecord.user_id == user.id,
        AttendanceRecord.check_in_time >= today_start
    ).first()

    if existing:
        if student_name and student_name.strip():
            existing.student_name = student_name.strip()
            db.commit()
            db.refresh(existing)
        return AttendanceRecordResponse.from_orm(existing)

    attendance = AttendanceRecord(
        user_id=user.id,
        status="present",
        student_name=(student_name.strip() if student_name else user.full_name)
    )

    try:
        db.add(attendance)
        user.is_online = True
        user.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(attendance)
        # Publish a live log event for admin dashboards
        event = {
            "student_name": attendance.student_name,
            "email": (user.email if user else None),
            "time": attendance.check_in_time.isoformat() if attendance.check_in_time else None,
            "status": attendance.status,
        }
        try:
            # schedule publish asynchronously so request returns fast
            asyncio.create_task(_publish_log(event))
        except Exception:
            pass
        return AttendanceRecordResponse.from_orm(attendance)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.get("/api/attendance/check-in", response_class=HTMLResponse)
def check_in_via_qr(email: Optional[str] = None):
    provided_email = email or ""
    html = f"""
    <!doctype html>
    <html lang="kk">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>Smart Campus — Қатысу</title>
        <style>
            body {{
                margin:0; padding:0; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                background: radial-gradient(circle at top, rgba(56,189,248,0.18), transparent 45%), radial-gradient(circle at bottom right, rgba(168,85,247,0.16), transparent 35%), #08101f;
                color: #e2e8f0;
                display:flex; align-items:center; justify-content:center; min-height:100vh;
            }}
            .card {{
                background: rgba(15,23,42,0.88); border:1px solid rgba(148,163,184,0.12); border-radius:28px; padding:32px;
                box-shadow:0 30px 80px rgba(0,0,0,0.35); width:min(560px,92%);
            }}
            h1 {{ margin:0 0 12px 0; font-size:28px; color:#93c5fd; }}
            p.lead {{ margin:0 0 18px 0; font-size:15px; color:#cbd5e1; font-weight:600; }}
            .input {{ width:100%; padding:14px 16px; border-radius:16px; border:1px solid rgba(148,163,184,0.18); margin-bottom:14px; font-size:16px; color:#f8fafc; background:rgba(15,23,42,0.8); }}
            .btn {{ display:inline-flex; align-items:center; justify-content:center; min-height:46px; border-radius:16px; background:linear-gradient(135deg,#38bdf8,#8b5cf6); color:white; font-weight:700; border:none; cursor:pointer; padding:0 18px; transition:transform .2s ease, box-shadow .2s ease; }}
            .btn:hover {{ transform:translateY(-1px); box-shadow:0 20px 40px rgba(56,189,248,0.25); }}
            .success {{ background:rgba(16,185,129,0.2); border:1px solid rgba(16,185,129,0.25); color:#d1fae5; padding:16px; border-radius:16px; font-weight:700; }}
            .small {{ font-size:13px; color:#94a3b8; margin-top:10px; }}
        </style>
    </head>
    <body>
        <div class="card" id="content">
            <h1>Smart Campus — QR Check-in</h1>
            <p class="lead">Enter your name and submit to register attendance quickly and securely.</p>
            <input id="student-name" class="input" placeholder="Student Name" autocomplete="name" />
            <input type="hidden" id="email" value="{provided_email}" />
            <div style="display:flex; gap:10px; justify-content:center; margin-top:12px;">
                <button id="submit" class="btn">Жіберу</button>
            </div>
            <p class="small">Your entry will be recorded instantly. Use the same name spelling each time.</p>
        </div>
        <script>
(function(){{
    const btn = document.getElementById('submit');
    const nameInput = document.getElementById('student-name');
    const email = document.getElementById('email').value;
    btn.addEventListener('click', async function(){{
        const name = nameInput.value && nameInput.value.trim();
        if(!name){{
            nameInput.focus();
            return;
        }}
        btn.disabled = true;
        btn.textContent = 'Жіберілуде...';
        try{{
            const res = await fetch('/api/attendance/check-in', {{
                method: 'POST',
                headers: {{ 'Content-Type': 'application/json' }},
                body: JSON.stringify({{ student_name: name, email: email || undefined }})
            }});
            if(!res.ok){{
                const txt = await res.text();
                throw new Error(txt || 'Server error');
            }}
            const data = await res.json();
            const checkTime = data.check_in_time;
            const local = new Date(checkTime).toLocaleTimeString([], {{hour:'2-digit', minute:'2-digit'}});
            document.getElementById('content').innerHTML = '<div class="success">' + (data.student_name || 'Студент') + ', қатысуыңыз сәтті тіркелді!<div class="small">Уақыт: ' + local + '</div></div>';
        }}catch(err){{
            alert('Қате: ' + (err.message || 'unknown'));
            btn.disabled = false;
            btn.textContent = 'Жіберу';
        }}
    }});
}})();
</script>
    </body>
    </html>
    """
    return HTMLResponse(content=html, status_code=200)


@app.post("/api/attendance/face-register", response_model=AttendanceRecordResponse)
def face_register(payload: dict = Body(...), db: Session = Depends(get_db)):
    """Register/check-in using face image + email/password from phone client.
    Payload: { email, password, image } where image is base64 data URL or raw base64 bytes.
    """
    email = payload.get('email')
    password = payload.get('password')
    image = payload.get('image')

    if not email or not password or not image:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="email, password and image are required")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        # create new student
        hashed = hash_password(password)
        user = User(email=email, hashed_password=hashed, full_name=email.split('@')[0].capitalize(), role=UserRole.student, is_active=True, is_online=False)
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        if not verify_password(password, user.hashed_password):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    # Create attendance record
    attendance = AttendanceRecord(user_id=user.id, status="present", student_name=user.full_name)
    try:
        db.add(attendance)
        user.is_online = True
        user.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(attendance)

        event = {
            "student_name": attendance.student_name,
            "email": user.email,
            "time": attendance.check_in_time.isoformat() if attendance.check_in_time else None,
            "status": attendance.status,
        }
        try:
            asyncio.create_task(_publish_log(event))
        except Exception:
            pass

        return AttendanceRecordResponse.from_orm(attendance)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.get('/api/logs/stream')
def logs_stream():
    """Server-Sent Events endpoint to stream live logs to admin dashboards."""
    async def event_generator():
        q: asyncio.Queue = asyncio.Queue()
        log_queues.append(q)
        try:
            while True:
                event = await q.get()
                yield f"data: {json.dumps(event)}\n\n"
        except GeneratorExit:
            return
        finally:
            try:
                log_queues.remove(q)
            except ValueError:
                pass

    return StreamingResponse(event_generator(), media_type='text/event-stream')


@app.post("/api/attendance/check-out", response_model=AttendanceRecordResponse)
def check_out(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    attendance = db.query(AttendanceRecord).filter(
        AttendanceRecord.user_id == current_user.id,
        AttendanceRecord.check_out_time.is_(None)
    ).order_by(AttendanceRecord.check_in_time.desc()).first()

    if not attendance:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active check-in found"
        )

    attendance.check_out_time = datetime.utcnow()
    current_user.is_online = False
    current_user.last_seen = datetime.utcnow()
    current_user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(attendance)
    return AttendanceRecordResponse.from_orm(attendance)


@app.get("/api/attendance/records", response_model=List[AttendanceRecordResponse])
def get_attendance_records(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    records = db.query(AttendanceRecord).filter(
        AttendanceRecord.user_id == current_user.id
    ).order_by(AttendanceRecord.check_in_time.desc()).all()
    return [AttendanceRecordResponse.from_orm(r) for r in records]


@app.get("/api/dashboard/stats", response_model=DashboardStats)
def get_stats(
    db: Session = Depends(get_db)
):
    try:
        total_students = db.query(User).filter(User.role == UserRole.student).count()
        total_online = db.query(User).filter(
            User.role == UserRole.student,
            User.is_online == True
        ).count()

        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        today_check_ins = db.query(AttendanceRecord).filter(
            AttendanceRecord.check_in_time >= today_start
        ).count()

        if total_students == 0:
            if today_check_ins > 0:
                total_students = 1
                total_online = 1
            else:
                total_students = 1

        total_offline = total_students - total_online
        check_in_percentage = (today_check_ins / total_students * 100) if total_students > 0 else 0

        return DashboardStats(
            total_online=total_online,
            total_offline=total_offline,
            total_students=total_students,
            check_in_percentage=round(check_in_percentage, 2)
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.get("/api/dashboard/today-checkins")
def get_today_checkins(
    db: Session = Depends(get_db)
):
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    records = db.query(AttendanceRecord).filter(
        AttendanceRecord.check_in_time >= today_start
    ).order_by(AttendanceRecord.check_in_time.desc()).all()

    result = []
    for record in records:
        user = db.query(User).filter(User.id == record.user_id).first()
        result.append({
            "student_name": (record.student_name or (user.full_name if user and user.full_name else None) or (user.email if user else None)),
            "student_email": (user.email if user else None),
            "time": record.check_in_time.isoformat() if record.check_in_time else None,
            "status": record.status,
        })

    return result


@app.get("/api/dashboard/export-logs")
def export_logs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    records = db.query(AttendanceRecord).order_by(AttendanceRecord.check_in_time.desc()).all()
    workbook = Workbook()
    worksheet = workbook.active
    worksheet.title = "Attendance Logs"
    worksheet.append([
        "ID",
        "User Email",
        "Student Name",
        "Status",
        "Check-in Time",
        "Check-out Time",
        "Created At",
    ])

    for record in records:
        user = db.query(User).filter(User.id == record.user_id).first()
        worksheet.append([
            record.id,
            user.email if user else None,
            record.student_name,
            record.status,
            record.check_in_time.isoformat() if record.check_in_time else None,
            record.check_out_time.isoformat() if record.check_out_time else None,
            record.created_at.isoformat() if record.created_at else None,
        ])

    output = io.BytesIO()
    workbook.save(output)
    output.seek(0)
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=attendance_logs.xlsx"}
    )


@app.get("/api/dashboard/online-students", response_model=List[UserResponse])
def get_online_students(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    online_users = db.query(User).filter(
        User.role == UserRole.student,
        User.is_online == True
    ).all()
    return [UserResponse.from_orm(u) for u in online_users]


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }


# ========== ФРОНТЕНДТІ СТАТИКАЛЫҚ ҚЫЗМЕТ КӨРСЕТУ (Render үшін) ==========
FRONTEND_DIST = os.path.join(os.path.dirname(__file__), "frontend", "dist")

# Егер фронтенд build нәтижесі бар болса, статикалық файлдарды қызмет көрсету
if os.path.exists(FRONTEND_DIST) and os.path.isdir(FRONTEND_DIST):
    # Статикалық активтерді (CSS, JS, кескіндер) қызмет көрсету
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="assets")
    
    # API емес барлық сұрақтарды React index.html-ге бағыттау
    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str):
        # API сұрақтарын өткізіп жіберу (олар жоғарыда өңделеді)
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("openapi.json") or full_path.startswith("health"):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
        
        # Нақты файл жолын тексеру
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        
        # Басқа барлық жағдайда index.html қайтару (React Router үшін)
        index_path = os.path.join(FRONTEND_DIST, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
else:
    # Фронтенд build жоқ болса, тек API жұмыс істейді
    print("⚠️ Frontend build not found. Please run 'npm run build' in frontend directory")
    print(f"   Expected path: {FRONTEND_DIST}")


@app.get("/")
async def root_with_frontend():
    """Түбір сұрауы - егер фронтенд болса, оны қайтарады"""
    index_path = os.path.join(FRONTEND_DIST, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {
        "message": "Welcome to Smart Campus Premium API 🎓",
        "docs": "/docs",
        "version": "1.0.0",
        "frontend_status": "Not built. Run 'cd frontend && npm run build'"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)