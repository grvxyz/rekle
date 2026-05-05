## Backend Setup

cd backend

python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt

copy .env.example .env

python -m app.db.init_db

uvicorn app.main:app --reload