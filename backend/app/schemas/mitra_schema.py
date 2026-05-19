from typing import Optional

from pydantic import BaseModel


class MitraResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    accepted_waste: Optional[str] = None
    mitra_type: str
    is_active: bool
    user_id: Optional[int] = None

    model_config = {"from_attributes": True}


class MitraCreate(BaseModel):
    name: str
    description: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    accepted_waste: Optional[str] = None
    mitra_type: str = "bank_sampah"
    is_active: bool = True


class MitraUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    accepted_waste: Optional[str] = None
    mitra_type: Optional[str] = None
    is_active: Optional[bool] = None
