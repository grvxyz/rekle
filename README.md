# REKLE — Platform Klasifikasi Sampah Berbasis AI

> Platform cerdas untuk klasifikasi sampah, edukasi lingkungan, dan gamifikasi aksi hijau.

---

## Daftar Isi

- [Tentang Proyek](#tentang-proyek)
- [Fitur Utama](#fitur-utama)
- [Arsitektur Sistem](#arsitektur-sistem)
- [Tech Stack](#tech-stack)
- [Struktur Proyek](#struktur-proyek)
- [Model Machine Learning](#model-machine-learning)
- [API Endpoints](#api-endpoints)
- [Alur Aplikasi](#alur-aplikasi)
- [Konfigurasi & Environment Variables](#konfigurasi--environment-variables)
- [Cara Menjalankan](#cara-menjalankan)
- [Database Seeder & Akun Default](#database-seeder--akun-default)
- [Role & Akses](#role--akses)
- [Sistem Poin & Gamifikasi](#sistem-poin--gamifikasi)

---

## Tentang Proyek

**REKLE** adalah platform web full-stack yang membantu pengguna mengidentifikasi jenis sampah melalui foto menggunakan model AI (MobileNetV2), kemudian mengarahkan mereka ke aksi pengelolaan sampah yang tepat — mulai dari kompos, daur ulang, reuse, eco brick, hingga penanganan limbah B3/medis. Platform ini dilengkapi sistem gamifikasi berupa poin, badge, challenge, dan leaderboard untuk mendorong partisipasi aktif.

---

## Fitur Utama

### Pengguna (User)
- **Scan Sampah (AI)** — Upload foto sampah, model MobileNetV2 mengklasifikasikan ke 9 kategori dan memberikan rekomendasi aksi serta ide upcycling
- **Scan tanpa login (Guest Mode)** — Pengguna tamu dapat mencoba fitur scan tanpa perlu mendaftar
- **Action Hub** — Pilih jalur aksi (mandiri atau lewat mitra) sesuai rekomendasi scan: kompos, daur ulang, reuse, eco brick, khusus (B3/medis), bank sampah
- **Gamifikasi** — Kumpulkan poin dari scan dan aksi, raih badge, ikuti challenge, pantau di leaderboard
- **Riwayat** — Lihat riwayat scan dan aksi beserta statusnya (pending / approved / rejected)
- **Profil** — Edit data diri, avatar, kota, dan bio

### Mitra (Waste Partner)
- **Registrasi & Verifikasi** — Mitra mendaftar dan menunggu persetujuan admin
- **Dashboard Mitra** — Kelola verifikasi aksi yang dikirim pengguna melalui jalur mitra
- **Riwayat Transaksi** — Pantau semua aksi yang masuk beserta berat sampah dan saldo yang diberikan

### Admin
- **Dashboard Admin** — Statistik real-time: total pengguna, scan, aksi, poin terdistribusi, top kategori sampah
- **Manajemen Pengguna** — Lihat dan kelola seluruh akun pengguna
- **Konfirmasi Aksi** — Verifikasi atau tolak aksi yang diajukan pengguna (termasuk input berat sampah untuk mitra)
- **Verifikasi Mitra** — Setujui atau tolak pendaftaran mitra baru
- **Data Mitra** — Kelola daftar mitra aktif
- **AI Monitoring** — Pantau performa model klasifikasi
- **Action Tracking** — Lacak distribusi aksi pengguna
- **Manajemen Konten** — Kelola konten edukasi yang tampil di platform

---

## Arsitektur Sistem

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (React)                  │
│   User UI  │  Admin Panel  │  Mitra Dashboard        │
└──────────────────────┬──────────────────────────────┘
                       │ REST API (Axios + JWT)
┌──────────────────────▼──────────────────────────────┐
│              Backend (FastAPI)                       │
│   Auth  │  User  │  Admin  │  Mitra  │  Actions     │
│                 Scan (ML Inference)                  │
└──────────────┬───────────────────┬──────────────────┘
               │                   │
    ┌──────────▼──────┐   ┌────────▼──────────┐
    │  PostgreSQL DB   │   │  ML Model         │
    │  (SQLAlchemy)    │   │  MobileNetV2      │
    └─────────────────┘   │  (.keras)         │
                          └───────────────────┘
```

---

## Tech Stack

### Backend
| Komponen | Teknologi |
|---|---|
| Framework | FastAPI |
| ORM | SQLAlchemy 2.x (Mapped API) |
| Database | PostgreSQL |
| Autentikasi | JWT (access token + refresh token, HS256) |
| ML Framework | TensorFlow / Keras |
| Model | MobileNetV2 (fine-tuned) |
| File Storage | Local filesystem (opsional S3/AWS) |
| Konfigurasi | pydantic-settings + `.env` |

### Frontend
| Komponen | Teknologi |
|---|---|
| Framework | React 18 (Vite) |
| Routing | React Router v6 |
| HTTP Client | Axios (dengan interceptor auto-refresh JWT) |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| State Management | React Context (AuthContext) |

---

## Struktur Proyek

```
rekle/
├── app/                         # Backend (FastAPI)
│   ├── main.py                  # Entry point aplikasi
│   ├── core/
│   │   └── config.py            # Konfigurasi via pydantic-settings
│   ├── api/
│   │   └── v1/
│   │       ├── api.py           # Router utama
│   │       ├── deps.py          # Dependency injection (auth)
│   │       └── endpoints/
│   │           ├── auth.py      # Register, Login, Refresh Token
│   │           ├── user.py      # Profil & data pengguna
│   │           ├── scan.py      # Upload gambar + inferensi AI
│   │           ├── action.py    # Buat & verifikasi aksi
│   │           ├── admin.py     # Dashboard & manajemen admin
│   │           ├── mitra.py     # Manajemen mitra
│   │           └── content.py   # Konten edukasi
│   ├── models/
│   │   ├── user.py              # Model User
│   │   ├── prediction.py        # Model hasil scan AI
│   │   ├── action.py            # Model aksi pengguna
│   │   ├── badge.py             # Model badge & relasi user-badge
│   │   ├── mitra.py             # Model mitra
│   │   ├── point_setting.py     # Konfigurasi poin per aksi
│   │   └── content.py           # Model konten
│   ├── schemas/                 # Pydantic schemas (request/response)
│   ├── services/                # Business logic (auth, gamifikasi)
│   ├── db/
│   │   ├── base.py              # Base model (id, created_at, updated_at)
│   │   ├── session.py           # Engine & session factory
│   │   └── init_db.py           # Inisialisasi database
│   └── ml/
│       ├── classifier.py        # Inferensi model TF/Keras
│       ├── preprocessor.py      # Preprocessing gambar
│       ├── recommendation.py    # Pemetaan label → aksi
│       ├── upcycle_ideas.py     # Ide upcycling per kategori
│       ├── mobilenet_final.keras        # Model utama
│       ├── REKLE_MobileNetV2_Final.keras
│       └── class_names.json     # 9 kelas sampah
│
└── src/                         # Frontend (React)
    ├── main.jsx
    ├── App.jsx                  # Routes & layout utama
    ├── context/
    │   └── AuthContext.jsx      # State autentikasi global
    ├── lib/
    │   ├── axios.js             # Axios instance + auto-refresh interceptor
    │   └── imageURL.js
    ├── pages/
    │   ├── auth/                # Login & Register
    │   ├── landing/             # Landing page publik
    │   ├── dashboard/           # Dashboard pengguna
    │   ├── scan/                # Halaman scan sampah
    │   ├── action/              # Action hub (6 jenis aksi)
    │   ├── challenge/           # Halaman challenge
    │   ├── history/             # Riwayat scan & aksi
    │   ├── profile/             # Profil pengguna
    │   ├── leaderboard/         # Leaderboard
    │   ├── admin/               # Panel admin (8 halaman)
    │   └── mitra/               # Portal mitra (6 halaman)
    └── components/              # Komponen UI reusable
```

---

## Model Machine Learning

REKLE menggunakan **MobileNetV2** yang di-fine-tune untuk klasifikasi 9 kategori sampah:

| Label | Kategori | Rekomendasi Aksi |
|---|---|---|
| `organik` | Sampah organik | Kompos |
| `Plastik` | Plastik | Daur ulang |
| `Kertas` | Kertas | Daur ulang |
| `Kardus` | Kardus | Daur ulang |
| `Kaca` | Kaca | Reuse |
| `Logam` | Logam | Daur ulang |
| `B3` | Limbah B3 (bahan berbahaya) | Penanganan khusus |
| `Medis` | Limbah medis | Penanganan khusus |
| `nonsampah` | Bukan sampah | — |

**Logika confidence:**
- Prediksi dianggap valid (`is_confident = True`) hanya jika:
  - Confidence top-1 ≥ **0.7** (70%)
  - Gap antara top-1 dan top-2 ≥ **0.2** (20%)
- Jika tidak memenuhi kedua syarat → label dikembalikan sebagai **"Tidak dikenali"**

---

## API Endpoints

### Auth — `/api/v1/auth`
| Method | Endpoint | Deskripsi |
|---|---|---|
| `POST` | `/register` | Daftar akun baru |
| `POST` | `/login` | Login, mendapatkan token pair |
| `POST` | `/refresh` | Perbarui access token dengan refresh token |

### Scan — `/api/v1/scan`
| Method | Endpoint | Deskripsi | Auth |
|---|---|---|---|
| `POST` | `/upload` | Upload & klasifikasi gambar sampah | ✅ User |
| `POST` | `/upload-guest` | Scan tanpa login (tidak simpan ke DB) | ❌ |
| `GET` | `/history` | Riwayat scan milik user | ✅ User |
| `GET` | `/{id}` | Detail satu hasil scan | ✅ User |

### Actions — `/api/v1/actions`
| Method | Endpoint | Deskripsi | Auth |
|---|---|---|---|
| `POST` | `/` | Buat aksi baru (status: pending) | ✅ User |
| `GET` | `/` | Daftar aksi milik user | ✅ User |
| `POST` | `/{id}/upload-proof` | Upload foto bukti aksi | ✅ User |
| `PUT` | `/{id}/verify` | Verifikasi/tolak aksi | ✅ Admin |

### Admin — `/api/v1/admin`
| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/dashboard` | Statistik dashboard (filter by date) |
| `GET` | `/users` | Daftar semua pengguna |
| `GET/PUT` | `/users/{id}` | Detail & edit pengguna |
| `GET` | `/content` | Daftar konten edukasi |
| `POST/PUT/DELETE` | `/content` | CRUD konten |

### Mitra — `/api/v1/mitra`
| Method | Endpoint | Deskripsi |
|---|---|---|
| `POST` | `/register` | Daftar sebagai mitra |
| `GET` | `/` | Daftar mitra (publik/admin) |
| `GET` | `/me` | Profil mitra yang login |
| `PUT` | `/me` | Update profil mitra |

---

## Alur Aplikasi

```
Pengguna Upload Foto
        │
        ▼
 Validasi gambar (tipe & ukuran)
        │
        ▼
  Inferensi ML (MobileNetV2)
        │
        ├── is_confident = True ──► Tampilkan kategori + rekomendasi + ide upcycling
        │                                  │
        │                          Pengguna pilih aksi
        │                                  │
        │                    ┌─────────────┴─────────────┐
        │                    │                           │
        │               Mandiri                        Mitra
        │             (self-action)            (kirim ke mitra)
        │                    │                           │
        │             Upload bukti foto          Tunggu verifikasi mitra
        │                    │                           │
        │              Status: pending             Verifikasi berat sampah
        │                    │                           │
        │             Admin verifikasi ◄──────────────────┘
        │                    │
        │         ┌──────────┴──────────┐
        │         │                     │
        │      Approved               Rejected
        │         │                     │
        │    +50 poin &           Kirim alasan
        │    saldo (jika mitra)    penolakan
        │
        └── is_confident = False ──► "Tidak dikenali" (scan tetap +10 poin)
```

---

## Konfigurasi & Environment Variables

Buat file `.env` di root backend berdasarkan variabel berikut:

```env
# App
APP_NAME=REKLE
ENVIRONMENT=development       # development | production
DEBUG=true

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/rekle_db

# JWT
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS
ALLOWED_ORIGINS=http://localhost:5173,https://rekle.vercel.app

# Upload
UPLOAD_DIR=uploads
MAX_UPLOAD_SIZE_MB=10
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp

# ML Model
ML_MODEL_PATH=app/ml/mobilenet_final.keras
ML_CLASS_NAMES_PATH=app/ml/class_names.json
ML_IMAGE_SIZE=224
ML_CONFIDENCE_THRESHOLD=0.7
ML_CONFIDENCE_GAP_THRESHOLD=0.2

# Poin & Saldo
POINTS_PER_SCAN=10
POINTS_PER_ACTION=50
POINTS_PER_CHALLENGE=200
BALANCE_PER_KG=2000           # Rp per kg sampah ke mitra

# AWS S3 (opsional)
USE_S3=false
S3_BUCKET_NAME=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_ENDPOINT_URL=
```

Untuk frontend, buat file `.env` di root frontend:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

---

## Cara Menjalankan

### Backend

```bash
# 1. Buat virtual environment
python -m venv venv
source venv/bin/activate        # Linux/Mac
venv\Scripts\activate           # Windows

# 2. Install dependensi
pip install fastapi uvicorn sqlalchemy pydantic-settings \
            tensorflow pillow python-jose passlib alembic \
            python-multipart psycopg2-binary

# 3. Siapkan file .env (lihat bagian Konfigurasi)

# 4. Inisialisasi database
python -c "from app.db.init_db import init_db; init_db()"

# 5. Jalankan server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API tersedia di: `http://localhost:8000`  
Dokumentasi interaktif: `http://localhost:8000/docs`

### Frontend

```bash
# 1. Install dependensi
npm install

# 2. Siapkan file .env
echo "VITE_API_BASE_URL=http://localhost:8000/api/v1" > .env

# 3. Jalankan dev server
npm run dev
```

Frontend tersedia di: `http://localhost:5173`

### Menjalankan dengan Docker

Jika proyek dikonfigurasi dengan Docker Compose:

```bash
# Jalankan seluruh stack (backend + database)
docker compose up -d

# Cek status container
docker compose ps
```

Backend akan tersedia di `http://localhost:8000` dan frontend di `http://localhost:5173` (atau port yang dikonfigurasi).

---

## Database Seeder & Akun Default

Setelah container berjalan, jalankan seeder untuk membuat akun admin dan user default:

```bash
docker exec -it rekle-backend python seed.py
```

Seeder bersifat **idempoten** — aman dijalankan lebih dari satu kali, akun hanya dibuat jika belum ada.

### Akun Default

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@rekle.com` | `admin123` |
| **User** | `user@rekle.com` | `user123` |

> ⚠️ Ganti password default sebelum deploy ke production.

---

## Role & Akses

| Role | Akses |
|---|---|
| **Guest** | Landing page, Scan (tanpa simpan data & poin) |
| **User** | Semua fitur pengguna: scan, aksi, challenge, riwayat, profil, leaderboard |
| **Mitra** | Portal mitra: dashboard, verifikasi aksi, riwayat, profil mitra |
| **Admin** (`is_superuser=True`) | Panel admin penuh: semua statistik, manajemen user, verifikasi aksi & mitra, konten |

Proteksi route di frontend menggunakan komponen:
- `<ProtectedRoute>` — Wajib login sebagai user biasa
- `<AdminRoute>` — Wajib login sebagai superuser
- `<MitraRoute>` — Wajib login, bukan superuser
- `<RedirectIfLoggedIn>` — Redirect ke dashboard jika sudah login

---

## Sistem Poin & Gamifikasi

| Event | Poin / Reward |
|---|---|
| Scan berhasil | **+10 poin** (langsung) |
| Aksi diverifikasi admin | **+50 poin** (setelah verifikasi) |
| Challenge selesai | **+200 poin** |
| Aksi via mitra (diverifikasi) | **+poin + saldo Rp 2.000/kg** |

**Badge** diberikan berdasarkan jumlah scan atau aksi yang diselesaikan (`requirement_count`).  
**Leaderboard** menampilkan ranking pengguna berdasarkan total poin.  
**Challenge** adalah misi bertimed yang mendorong pengguna melakukan aksi tertentu.

---

## Lisensi

© 2026 REKLE. Semua hak dilindungi.