import bcrypt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash using bcrypt directly"""
    try:
        return bcrypt.checkpw(
            plain_password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )
    except Exception as e:
        print(f"Password verification error: {e}")
        return False

def hash_password(password: str) -> str:
    """Hash a password using bcrypt directly"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def get_password_hash(password: str) -> str:
    """Compatibility wrapper so auth.py can import this normally"""
    return hash_password(password)
