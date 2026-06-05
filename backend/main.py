from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Smart Campus API is running"}

@app.get("/api/students")
def get_students():
<<<<<<< HEAD
    return []

@app.get("/api/health")
def health():
    return {"status": "ok"}
=======
    return []   # Уақытша бос тізім
>>>>>>> d401fb1 (Add working backend)
