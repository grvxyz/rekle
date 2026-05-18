from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ContentBase(BaseModel):
    title: str
    description: Optional[str] = None
    type: str
    status: str


class ContentCreate(ContentBase):
    pass


class ContentUpdate(BaseModel):
    title: Optional[str]
    description: Optional[str]
    type: Optional[str]
    status: Optional[str]


class ContentResponse(ContentBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True  # pydantic v2