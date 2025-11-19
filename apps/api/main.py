import sys
from pathlib import Path

# Add monorepo root to Python path
monorepo_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(monorepo_root))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from core.config import *

from packages.database.database import Base, engine

# Import routers
from routers import auth, users, hotels



app = FastAPI(title="Hotel Monorepo API")

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
allow_origins=["http://localhost:3000"],
allow_methods=["*"],
allow_headers=["*"],
)


# Create database tables
Base.metadata.create_all(bind=engine)

@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}

# Include routers
app.include_router(auth.router, prefix="/api/auth")  # ✅ Correct prefix
app.include_router(users.router, prefix="/api/users")
app.include_router(hotels.router, prefix="/api/hotels")
