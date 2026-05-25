from pydantic import BaseModel

from typing import Optional

from datetime import datetime


class ContentBase(BaseModel):

    title: str

    description: Optional[str] = None

    # tips
    # challenge
    # reward
    type: str

    status: str

    # challenge specific
    challenge_type: Optional[str] = None
    # scan
    # action
    # points

    target: Optional[int] = None

    reward_points: Optional[int] = 0


class ContentCreate(ContentBase):
    pass


class ContentUpdate(BaseModel):

    title: Optional[str] = None

    description: Optional[str] = None

    type: Optional[str] = None

    status: Optional[str] = None

    challenge_type: Optional[str] = None

    target: Optional[int] = None

    reward_points: Optional[int] = None


class ContentResponse(ContentBase):

    id: int

    created_at: datetime

    class Config:
        from_attributes = True