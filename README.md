# REKLE

Backend architecture for REKLE with FastAPI, SQLAlchemy, and AI model support.

## Structure

- `backend/app/` — FastAPI application code
- `backend/app/api/v1/` — API routing and endpoint handlers
- `backend/app/core/` — app configuration and security utilities
- `backend/app/db/` — SQLAlchemy database setup
- `backend/app/models/` — ORM models
- `backend/app/schemas/` — Pydantic request/response schemas
- `backend/app/services/` — business logic and AI model service
- `backend/app/ml/` — AI model artifacts
- `backend/alembic/` — database migration scaffolding
- `frontend/` — React frontend placeholder

## Database Seeder
Untuk membuat akun default admin dan user, jalankan seeder berikut setelah container berjalan.

```bash
docker exec -it rekle-backend python seed.py
```

### Akun Default
#### Admin
- **Email:** `admin@rekle.com`
- **Password:** `admin123`

#### User
- **Email:** `user@rekle.com`
- **Password:** `user123`

Seeder hanya akan membuat akun jika belum tersedia, sehingga aman dijalankan lebih dari satu kali.