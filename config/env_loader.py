# config/env_loader.py
from pathlib import Path
from dotenv import load_dotenv

def load_local_env(env_path: str = ".env.local"):
    p = Path(env_path)
    if p.exists():
        load_dotenv(dotenv_path=str(p))
