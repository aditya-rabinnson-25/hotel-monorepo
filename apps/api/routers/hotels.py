from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from packages.database.database import get_db
from packages.database.models import Hotel
from packages.database.schemas import HotelCreate, HotelResponse

# ✅ import tenant extractor
from deps.tenant import get_tenant_id

router = APIRouter(prefix="/hotels", tags=["hotels"])


# ======================================================
# ✅ Get all hotels (tenant-aware)
# ======================================================
@router.get("/", response_model=List[HotelResponse])
def get_hotels(
    db: Session = Depends(get_db),
    tenant_id: str = Depends(get_tenant_id)  # ✅ tenant injected
):
    """
    Get all hotels (normally filter by tenant_id,
    but for now return all until multi-tenant DB design is implemented)
    """

    # ✅ Multi-tenant filtering example:
    # hotels = db.query(Hotel).filter(Hotel.tenant_id == tenant_id).all()

    # ✅ TEMP: return all hotels
    hotels = db.query(Hotel).all()
    return hotels


# ======================================================
# ✅ Get hotel by ID (tenant-aware)
# ======================================================
@router.get("/{hotel_id}", response_model=HotelResponse)
def get_hotel(
    hotel_id: int,
    db: Session = Depends(get_db),
    tenant_id: str = Depends(get_tenant_id)  # ✅ tenant injected
):
    hotel = db.query(Hotel).filter(Hotel.id == hotel_id).first()

    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")

    # ✅ Tenant isolation example:
    # if hotel.tenant_id != tenant_id:
    #     raise HTTPException(status_code=403, detail="Access denied")

    return hotel


# ======================================================
# ✅ Create hotel (tenant-aware)
# ======================================================
@router.post("/", response_model=HotelResponse, status_code=status.HTTP_201_CREATED)
def create_hotel(
    hotel_data: HotelCreate,
    db: Session = Depends(get_db),
    tenant_id: str = Depends(get_tenant_id)  # ✅ tenant injected
):
    """
    Create new hotel for the active tenant.
    """

    new_hotel = Hotel(
        name=hotel_data.name,
        address=hotel_data.address,
        owner_id=hotel_data.owner_id,
        # ✅ Add tenant id when your DB model supports it
        # tenant_id=tenant_id
    )

    db.add(new_hotel)
    db.commit()
    db.refresh(new_hotel)

    return new_hotel


# ======================================================
# ✅ Update KYC status (tenant-aware)
# ======================================================
@router.put("/{hotel_id}/kyc-status")
def update_kyc_status(
    hotel_id: int,
    status: str,
    db: Session = Depends(get_db),
    tenant_id: str = Depends(get_tenant_id)  # ✅ tenant injected
):
    hotel = db.query(Hotel).filter(Hotel.id == hotel_id).first()

    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")

    # ✅ Tenant isolation example:
    # if hotel.tenant_id != tenant_id:
    #     raise HTTPException(status_code=403, detail="Access denied")

    hotel.kyc_status = status
    db.commit()

    return {"message": "KYC status updated", "hotel_id": hotel_id, "status": status}
