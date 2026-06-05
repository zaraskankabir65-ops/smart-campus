from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from datetime import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

students_db = []

class RegisterRequest(BaseModel):
    fullName: str
    email: str
    password: str
    avatar: str = ""

@app.get("/")
def root():
    return {"message": "Smart Campus API is running"}

@app.get("/api/students")
def get_students():
    return students_db

@app.post("/api/register")
def register_student(student: RegisterRequest):
    for existing in students_db:
        if existing["email"] == student.email:
            raise HTTPException(status_code=400, detail="Email already registered")
    new_student = {
        "id": len(students_db) + 1,
        "fullName": student.fullName,
        "email": student.email,
        "password": student.password,
        "role": "student",
        "avatar": student.avatar or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        "registeredAt": datetime.now().isoformat()
    }
    students_db.append(new_student)
    return {"success": True, "student": new_student}
