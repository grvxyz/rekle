from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User


# Data users dari rekle_backup.sql (diurutkan berdasarkan ID)
USERS_FROM_BACKUP = [
    {
        "id": 1,
        "email": "radityanaufal2005@gmail.com",
        "full_name": "Raditya Naufal",
        "phone_number": "081228450028",
        "hashed_password": "$2b$12$ar5LATQVjiLxyKK0T07X5uxSBB.jHQWCa3mrFbqiRMbrSED0Opxrq",
        "is_active": True,
        "is_superuser": True,
        "total_points": 120,
        "scan_count": 15,
        "action_count": 7,
        "avatar_url": None,
        "city": "jogja",
        "bio": "Mahasiswa",
        "balance": 0,
        "role": "user",
    },
    {
        "id": 2,
        "email": "jenbut123@gmail.com",
        "full_name": "jen",
        "phone_number": "098276372829",
        "hashed_password": "$2b$12$9LQq26Inzsp3dHoQCHmex..iKoLy1gy1ppFRpPZ2d9G5iQp4qlg5W",
        "is_active": True,
        "is_superuser": False,
        "total_points": 140,
        "scan_count": 14,
        "action_count": 0,
        "avatar_url": None,
        "city": "jogja",
        "bio": "mahasiswa",
        "balance": 0,
        "role": "user",
    },
    {
        "id": 3,
        "email": "admin@rekle.com",
        "full_name": "Admin Rekle",
        "phone_number": None,
        "hashed_password": "$2b$12$soKqODmaOADqvxJgog58m.FbUU1gAPHaiLDGkyhKRH.mnEe0965CC",
        "is_active": True,
        "is_superuser": True,
        "total_points": 0,
        "scan_count": 0,
        "action_count": 0,
        "avatar_url": None,
        "city": None,
        "bio": None,
        "balance": 0,
        "role": "user",
    },
    {
        "id": 4,
        "email": "user@rekle.com",
        "full_name": "User Rekle",
        "phone_number": None,
        "hashed_password": "$2b$12$CUJ5mb0xa4zsQpiyRvBpB.Vv43vVSnGw0uEQRzoBztjxjB92NcMva",
        "is_active": True,
        "is_superuser": False,
        "total_points": 0,
        "scan_count": 0,
        "action_count": 0,
        "avatar_url": None,
        "city": None,
        "bio": None,
        "balance": 0,
        "role": "user",
    },
    {
        "id": 5,
        "email": "rads@mitra.com",
        "full_name": "Raditya N",
        "phone_number": None,
        "hashed_password": "$2b$12$LVyBvKC7R5iWr4Ib9REDXuAAYl1orFwir0IFFhgwQFM1A7QIcZzci",
        "is_active": True,
        "is_superuser": False,
        "total_points": 0,
        "scan_count": 0,
        "action_count": 0,
        "avatar_url": None,
        "city": None,
        "bio": None,
        "balance": 0,
        "role": "user",
    },
    {
        "id": 6,
        "email": "scenecraft73@gmail.com",
        "full_name": "Raditya Naufal",
        "phone_number": None,
        "hashed_password": "$2b$12$L6.VoZYwGz2JcMXo0gCj1OCsKLxL4Fsr0PZM9MRLSAZWSvT0mAwrW",
        "is_active": True,
        "is_superuser": False,
        "total_points": 0,
        "scan_count": 0,
        "action_count": 0,
        "avatar_url": None,
        "city": None,
        "bio": None,
        "balance": 0,
        "role": "user",
    },
    {
        "id": 7,
        "email": "scenecraft71@gmail.com",
        "full_name": "Vivi",
        "phone_number": None,
        "hashed_password": "$2b$12$RckHveJqDysjMAGsGdDHo.c9hsCfLgNOCNWSZjqxVmdB8jVt0RWQK",
        "is_active": True,
        "is_superuser": False,
        "total_points": 0,
        "scan_count": 0,
        "action_count": 0,
        "avatar_url": None,
        "city": None,
        "bio": None,
        "balance": 0,
        "role": "user",
    },
]


def seed_users():
    db: Session = SessionLocal()

    try:
        for data in USERS_FROM_BACKUP:
            existing = db.query(User).filter(User.email == data["email"]).first()

            if not existing:
                user = User(
                    email=data["email"],
                    full_name=data["full_name"],
                    hashed_password=data["hashed_password"],  # hash asli dari backup
                    is_active=data["is_active"],
                    is_superuser=data["is_superuser"],
                    total_points=data["total_points"],
                    scan_count=data["scan_count"],
                    action_count=data["action_count"],
                    balance=data["balance"],
                )

                # Set field opsional jika ada di model
                for field in ("phone_number", "avatar_url", "city", "bio", "role"):
                    if hasattr(user, field):
                        setattr(user, field, data.get(field))

                db.add(user)
                print(f"✅ Created: {data['email']}")
            else:
                print(f"⏭️  Skipped (already exists): {data['email']}")

        db.commit()
        print("\n✅ Seeding selesai.")

    except Exception as e:
        db.rollback()
        print("❌ Error:", e)

    finally:
        db.close()


if __name__ == "__main__":
    seed_users()