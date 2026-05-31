#!/usr/bin/env python3
"""
create_admin_user.py

Create or replace the admin user in the Smart Campus SQLite database.
This script uses the same passlib/bcrypt hashing scheme as backend/main.py.
"""

import argparse
from passlib.context import CryptContext

from database import SessionLocal, engine, Base
from models import User, UserRole

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def create_admin_user(email: str, password: str, full_name: str = "Admin User"):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            print(f"- Existing user found for {email}. Updating password and role.")
            existing.hashed_password = hash_password(password)
            existing.role = UserRole.admin
            existing.full_name = full_name
            existing.is_active = True
            existing.is_online = False
            db.commit()
            print(f"✅ Admin user updated: {email}")
            return

        hashed_pw = hash_password(password)
        admin_user = User(
            email=email,
            hashed_password=hashed_pw,
            full_name=full_name,
            role=UserRole.admin,
            is_active=True,
            is_online=False,
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        print(f"✅ Admin user created: {email} (id={admin_user.id})")
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Create or update admin user in Smart Campus DB')
    parser.add_argument('--email', default='admin@gmail.com', help='Admin user email')
    parser.add_argument('--password', default='admin2954', help='Admin user password')
    parser.add_argument('--name', default='Admin User', help='Admin full name')
    args = parser.parse_args()
    create_admin_user(args.email, args.password, args.name)
