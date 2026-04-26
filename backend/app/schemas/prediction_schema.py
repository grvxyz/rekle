from pydantic import BaseModel


class PredictionBase(BaseModel):
    user_id: int
    result: str
    confidence: str | None = None


class PredictionCreate(PredictionBase):
    pass


class Prediction(PredictionBase):
    id: int

    class Config:
        orm_mode = True
