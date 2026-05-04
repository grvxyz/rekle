from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.security import get_subject_from_token
from app.db.session import get_db
from app.models.user import User

# Endpoint yang akan dipanggil client untuk dapat token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Dependency utama — validasi JWT dan kembalikan user yang sedang login.

    Pemakaian di endpoint:
        @router.get("/me")
        def get_me(current_user: User = Depends(get_current_user)):
            ...
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token tidak valid atau sudah expired",
        headers={"WWW-Authenticate": "Bearer"},
    )

    user_id = get_subject_from_token(token, token_type="access")
    if user_id is None:
        raise credentials_exception

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akun tidak aktif",
        )

    return user


def get_current_superuser(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Dependency untuk endpoint admin only.

    Pemakaian:
        @router.delete("/users/{id}")
        def delete_user(current_user: User = Depends(get_current_superuser)):
            ...
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akses ditolak — hanya superuser",
        )
    return current_user