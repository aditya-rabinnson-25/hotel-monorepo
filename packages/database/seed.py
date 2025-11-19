from packages.database.database import Base, engine, SessionLocal
from packages.database.models import Role, Admin
from passlib.context import CryptContext

# Create password context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def seed():
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Create roles
        roles = ["super_admin", "admin", "manager", "staff", "viewer"]
        
        for role_name in roles:
            existing_role = db.query(Role).filter(Role.name == role_name).first()
            if not existing_role:
                new_role = Role(
                    name=role_name,
                    description=f"{role_name} role",
                    permissions={}
                )
                db.add(new_role)
        
        db.commit()
        print("✅ Roles created successfully")
        
        # Create default super admin
        existing_admin = db.query(Admin).filter(Admin.email == "superadmin@example.com").first()
        
        if not existing_admin:
            # Get super_admin role
            super_admin_role = db.query(Role).filter(Role.name == "super_admin").first()
            
            if super_admin_role:
                # Hash password with proper error handling
                password = "admin123"
                try:
                    hashed_password = pwd_context.hash(password)
                except Exception as e:
                    print(f"❌ Error hashing password: {e}")
                    # Fallback: use a simpler approach
                    import bcrypt
                    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                
                admin = Admin(
                    name="Super Admin",
                    email="superadmin@example.com",
                    password_hash=hashed_password,
                    role_id=super_admin_role.id
                )
                db.add(admin)
                db.commit()
                print("✅ Super Admin created successfully")
                print(f"   Email: superadmin@example.com")
                print(f"   Password: admin123")
            else:
                print("❌ Super admin role not found!")
        else:
            print("ℹ️  Super Admin already exists")
        
        print("\n✅ Database seeding completed!")
        
    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
