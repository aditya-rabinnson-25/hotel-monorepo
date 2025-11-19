from dotenv import load_dotenv
import os
from pathlib import Path

env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)
