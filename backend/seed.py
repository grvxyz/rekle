from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash


def seed_users():
    db: Session = SessionLocal()

    try:
        existing_admin = (
            db.query(User)
            .filter(User.email == "admin@rekle.com")
            .first()
        )

        if not existing_admin:
            admin = User(
                email="admin@rekle.com",
                full_name="Admin Rekle",
                hashed_password=get_password_hash("admin123"),
                is_active=True,
                is_superuser=True,
                total_points=0,
                scan_count=0,
                action_count=0,
                balance=0,
            )
            db.add(admin)
            print("Admin created")

        existing_user = (
            db.query(User)
            .filter(User.email == "user@rekle.com")
            .first()
        )

        if not existing_user:
            user = User(
                email="user@rekle.com",
                full_name="User Rekle",
                hashed_password=get_password_hash("user123"),
                is_active=True,
                is_superuser=False,
                total_points=0,
                scan_count=0,
                action_count=0,
                balance=0,
            )
            db.add(user)
            print("User created")

        db.commit()

    except Exception as e:
        db.rollback()
        print("❌ Error:", e)

    finally:
        db.close()


if __name__ == "__main__":
    seed_users()