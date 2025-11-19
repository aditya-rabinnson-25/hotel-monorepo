import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from packages.database.database import SessionLocal
from packages.database.models import Admin
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

db = SessionLocal()

# Get admin from database
admin = db.query(Admin).filter(Admin.email == "superadmin@example.com").first()

if admin:
    print(f"✅ Admin found: {admin.email}")
    print(f"   Name: {admin.name}")
    print(f"   Hash: {admin.password_hash}")
    
    # Test password
    test_password = "admin123"
    print(f"\n🔐 Testing password: '{test_password}'")
    
    try:
        is_valid = pwd_context.verify(test_password, admin.password_hash)
        print(f"   Result: {'✅ VALID' if is_valid else '❌ INVALID'}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
else:
    print("❌ Admin not found!")

db.close()
