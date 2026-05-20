from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.security import get_subject_from_token
from app.db.session import get_db
from app.models.user import User

# Endpoint yang akan dipanggil client untuk dapat token
oauth2_scheme          = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Dependency utama — validasi JWT dan kembalikan user yang sedang login.
    Wajib: jika tidak ada token → 401 Unauthorized.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token tidak valid atau sudah expired",
        headers={"WWW-Authenticate": "Bearer"},
    )

    user_id = get_subject_from_token(token, token_type="access")
    if user_id is None:
        raise credentials_exception

    try:
        parsed_id = int(user_id)
    except (ValueError, TypeError):
        raise credentials_exception

    user = db.query(User).filter(User.id == parsed_id).first()
    if user is None:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akun tidak aktif",
        )

    return user


def get_optional_user(
    token: str | None = Depends(oauth2_scheme_optional),
    db: Session = Depends(get_db),
) -> User | None:
    """
    Dependency opsional — kembalikan user jika ada token valid,
    kembalikan None jika guest (tidak ada token / token tidak valid).

    Dipakai oleh endpoint /scan/guest sehingga:
    - User login  → scan tersimpan ke DB + poin diberikan.
    - Guest       → scan diproses, hasil dikembalikan, tidak tersimpan ke DB.
    """
    if not token:
        return None

    user_id = get_subject_from_token(token, token_type="access")
    if user_id is None:
        return None

    try:
        parsed_id = int(user_id)
    except (ValueError, TypeError):
        return None

    user = db.query(User).filter(User.id == parsed_id).first()
    if user is None or not user.is_active:
        return None

    return user


def get_current_superuser(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Dependency untuk endpoint admin only.
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akses ditolak — hanya superuser",
        )
    return current_user
