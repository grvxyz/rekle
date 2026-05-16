from typing import Optional
from pydantic import BaseModel


# ──────────────────────────────────────────────
# ACCESS TOKEN (optional, kalau dipakai)
# ──────────────────────────────────────────────
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ──────────────────────────────────────────────
# TOKEN DATA (decode JWT)
# ──────────────────────────────────────────────
class TokenData(BaseModel):
    user_id: Optional[int] = None


# ──────────────────────────────────────────────
# TOKEN PAIR (LOGIN RESPONSE)
# ──────────────────────────────────────────────
class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


# ──────────────────────────────────────────────
# REFRESH REQUEST
# ──────────────────────────────────────────────
class RefreshRequest(BaseModel):
    refresh_token: str