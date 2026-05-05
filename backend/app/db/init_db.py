from app.db.base import Base
from app.db.session import engine

from app.models.user import User
from app.models.badge import Badge, user_badges
from app.models.action import Action
from app.models.prediction import Prediction


def init_db():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("Done.")


if __name__ == "__main__":
    init_db()