from fastapi import APIRouter, Depends, HTTPException, Response, Request
from fastapi.responses import JSONResponse, RedirectResponse
from sqlalchemy.orm import Session
import os, httpx
from pydantic import BaseModel

from packages.database.database import get_db, Base, engine
from packages.database.models import Admin, User, Role
from packages.database.schemas import LoginRequest, Token
from core.security import verify_password, get_password_hash
from core.jwt import create_access_token, decode_access_token

router = APIRouter(tags=["auth"])

Base.metadata.create_all(bind=engine)


# ============================================================
# ✅ COOKIE SETTINGS
# ============================================================
AUTH_COOKIE_NAME = os.getenv("AUTH_COOKIE_NAME", "access_token")
COOKIE_MAX_AGE = int(os.getenv("AUTH_COOKIE_MAX_AGE", "3600"))


def _set_auth_cookie(response: Response, token: str):
    response.set_cookie(
        key=AUTH_COOKIE_NAME,
        value=token,
        httponly=True,
        secure=False,
        samesite="Lax",
        max_age=COOKIE_MAX_AGE,
        path="/"
    )




def _clear_auth_cookie(response: Response):
    response.delete_cookie(key=AUTH_COOKIE_NAME, path="/")


# ============================================================
# ✅ NORMAL EMAIL/PASSWORD LOGIN
# ============================================================
# ----- LOGIN ENDPOINT (UPDATED!) -----
@router.post("/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.email == payload.email).first()
    if admin and verify_password(payload.password, admin.password_hash):
        token = create_access_token({"sub": str(admin.id), "role": "super_admin"})
        result = {"access_token": token}
        resp = JSONResponse(content=result)
        _set_auth_cookie(resp, token)
        return resp

    user = db.query(User).filter(User.email == payload.email).first()
    if user and verify_password(payload.password, user.password_hash):
        role = db.query(Role).filter(Role.id == user.role_id).first()
        token = create_access_token({"sub": str(user.id), "role": role.name})
        result = {"access_token": token}
        resp = JSONResponse(content=result)
        _set_auth_cookie(resp, token)
        return resp

    raise HTTPException(status_code=401, detail="Invalid email or password")


# ============================================================
# ✅ LOGOUT
# ============================================================
@router.post("/logout")
def logout(response: Response):
    _clear_auth_cookie(response)
    return {"detail": "logged out"}


# ============================================================
# ✅ GOOGLE SSO (Works as before)
# ============================================================
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
GOOGLE_REDIRECT_URI = "http://localhost:8001/api/auth/google/callback"


@router.get("/google/login")
async def google_login():
    google_url = (
        "https://accounts.google.com/o/oauth2/v2/auth"
        f"?client_id={GOOGLE_CLIENT_ID}"
        f"&redirect_uri={GOOGLE_REDIRECT_URI}"
        "&response_type=code"
        "&scope=openid%20email%20profile"
    )
    return RedirectResponse(url=google_url)


@router.get("/google/callback")
async def google_callback(
    code: str,
    response: Response,        # <-- MUST BE HERE
    db: Session = Depends(get_db)
):
    token_url = "https://oauth2.googleapis.com/token"

    token_payload = {
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": GOOGLE_REDIRECT_URI,
    }

    async with httpx.AsyncClient() as client:
        token_res = await client.post(token_url, data=token_payload)

    if token_res.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid Google code")

    tokens = token_res.json()
    access_token = tokens.get("access_token")

    async with httpx.AsyncClient() as client:
        userinfo = (await client.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {access_token}"}
        )).json()

    email = userinfo.get("email")
    name = userinfo.get("name") or email.split("@")[0]

    user = db.query(User).filter(User.email == email).first()
    if not user:
        default_role = db.query(Role).filter(Role.name == "viewer").first()
        user = User(
            name=name,
            email=email,
            password_hash=get_password_hash(os.urandom(8).hex()),
            role_id=default_role.id if default_role else None,
            status=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    role = db.query(Role).filter(Role.id == user.role_id).first()
    token = create_access_token({"sub": str(user.id), "role": role.name})

    # ⭐ MUST SET COOKIE ON THIS RESPONSE
    redirect = RedirectResponse(url=f"{FRONTEND_URL}/dashboard")
    _set_auth_cookie(redirect, token)
    return redirect




# ============================================================
# ✅ BETTER AUTH EMAIL SIGN-IN (MAIN ONE)
# ============================================================
class EmailLoginRequest(BaseModel):
    email: str
    password: str

@router.post("/sign-in/email")
def sign_in_email(payload: EmailLoginRequest, db: Session = Depends(get_db)):
    email = payload.email
    password = payload.password

    admin = db.query(Admin).filter(Admin.email == email).first()
    if admin and verify_password(password, admin.password_hash):
        token = create_access_token({"sub": str(admin.id), "role": "super_admin"})
        result = {
            "data": {
                "session": {
                    "token": token,
                    "user": {
                        "id": str(admin.id),
                        "email": admin.email,
                        "name": admin.name,
                        "role": "super_admin"
                    }
                }
            }
        }
        resp = JSONResponse(content=result)
        _set_auth_cookie(resp, token)
        return resp

    user = db.query(User).filter(User.email == email).first()
    if user and verify_password(password, user.password_hash):
        role = db.query(Role).filter(Role.id == user.role_id).first()
        token = create_access_token({"sub": str(user.id), "role": role.name})
        result = {
            "data": {
                "session": {
                    "token": token,
                    "user": {
                        "id": str(user.id),
                        "email": user.email,
                        "name": user.name,
                        "role": role.name
                    }
                }
            }
        }
        resp = JSONResponse(content=result)
        _set_auth_cookie(resp, token)
        return resp

    raise HTTPException(status_code=401, detail="Invalid credentials")

# ============================================================
# ✅ GET SESSION (Used by frontend)
# ============================================================
@router.get("/get-session")
def get_session(request: Request, db: Session = Depends(get_db)):
    token = request.cookies.get(AUTH_COOKIE_NAME)
    if not token:
        return {"data": None}

    try:
        payload = decode_access_token(token)
    except:
        return {"data": None}

    user_id = payload.get("sub")
    role = payload.get("role")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"data": None}

    return {
        "data": {
            "session": {
                "token": token,
                "user": {
                    "id": str(user.id),
                    "email": user.email,
                    "name": user.name,
                    "role": role,
                }
            }
        }
    }


print("GOOGLE_CLIENT_ID =", GOOGLE_CLIENT_ID)
print("GOOGLE_CLIENT_SECRET =", GOOGLE_CLIENT_SECRET)
