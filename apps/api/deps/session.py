import httpx
from fastapi import Request, HTTPException

BETTER_AUTH_URL = "http://localhost:3000"  # NEXT base

async def get_current_user_from_better_auth(request: Request):
    # forward better-auth cookie to Next.js auth session endpoint
    cookie = request.headers.get("cookie")
    if not cookie:
        raise HTTPException(status_code=401, detail="No auth cookie")

    async with httpx.AsyncClient(timeout=5) as client:
        r = await client.get(f"{BETTER_AUTH_URL}/api/auth/session", headers={"cookie": cookie})
    if r.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid session")
    data = r.json()  # { user, organization, session }

    return data  # you can map to your User model if needed
