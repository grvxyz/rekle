from ..core.security import verify_password, get_password_hash


def authenticate_user(email: str, password: str):
    # Placeholder for authentication logic
    return False


def create_user_password(password: str) -> str:
    return get_password_hash(password)