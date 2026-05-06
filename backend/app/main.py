from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.v1.api import api_router
from app.api.v1.endpoints import scan
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="REKLE Backend")

# ✅ CORS CONFIG
origins = [
    "http://localhost:5173",  # React Vite
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")
app.include_router(scan.router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "Welcome to REKLE backend"}