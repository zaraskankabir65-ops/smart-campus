#!/usr/bin/env python3
"""
recreate_student_user.py

Usage:
  python recreate_student_user.py --email student@gmail.com --password Wiliwonka2954

This script removes any existing user with the provided email from the SQLite database
and recreates it using the same password hashing (passlib/bcrypt) as used in the FastAPI app.

Run this from the `backend/` directory so the relative DB path matches `database.py`.
"""
import argparse
import os
from datetime import datetime

from passlib.context import CryptContext

# Import project database & models
from database import SessionLocal, engine, Base
from models import User, UserRole

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def recreate_user(email: str, password: str, full_name: str = "Demo Student"):
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            print(f"- Found existing user with email {email} (id={existing.id}). Deleting...")
            db.delete(existing)
            db.commit()
            print("- Existing user deleted.")

        hashed_pw = hash_password(password)
        user = User(
            email=email,
            hashed_password=hashed_pw,
            full_name=full_name,
            role=UserRole.student,
            is_active=True,
            is_online=False,
            # created_at/updated_at handled by DB defaults
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        print(f"✅ Recreated user: {email} (id={user.id})")
        print("Note: Password stored as bcrypt hash using passlib.CryptContext (bcrypt).")
    except Exception as e:
        print(f"❌ Error while recreating user: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Recreate student user in SQLite DB')
    parser.add_argument('--email', type=str, default='student@gmail.com', help='User email')
    parser.add_argument('--password', type=str, default='Wiliwonka2954', help='User password (plain)')
    parser.add_argument('--name', type=str, default='Demo Student', help='Full name')

    args = parser.parse_args()

    # Run
    recreate_user(args.email, args.password, args.name)
