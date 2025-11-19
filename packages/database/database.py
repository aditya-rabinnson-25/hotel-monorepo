from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from pathlib import Path

# Get the absolute path to this file's directory
current_dir = Path(__file__).parent

# Use absolute path to dev.db in the same directory as this file
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"sqlite:///{current_dir}/dev.db"  # Absolute path
)

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
