from fastapi import Header, HTTPException
from typing import Optional

async def get_tenant_id(
    x_tenant_id: Optional[str] = Header(default=None, alias="X-Tenant-Id")
):
    """
    Extract tenant ID from the header.
    For now, tenant_id is optional. Enforce later if required.
    """
    return x_tenant_id
