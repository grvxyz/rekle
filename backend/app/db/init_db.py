from app.db.base import Base
from app.db.session import engine

# 🔥 WAJIB: import semua model di sini
from app.models.user import User
from app.models.badge import Badge, UserBadge
from app.models.action import Action
from app.models.prediction import Prediction


def init_db():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("Done.")