import io
from typing import Tuple

import numpy as np
from PIL import Image

from app.core.config import settings

# =========================================================
# LOAD IMAGE
# =========================================================
def load_image_from_bytes(
    image_bytes: bytes,
) -> Image.Image:
    """
    Ubah bytes upload menjadi PIL Image.
    """
    return Image.open(
        io.BytesIO(image_bytes)
    ).convert("RGB")


# =========================================================
# PREPROCESS IMAGE
# =========================================================
def preprocess(
    image_bytes: bytes,
) -> np.ndarray:
    """
    Preprocessing image untuk MobileNetV2.

    Step:
    1. Load image
    2. Resize ke 224x224
    3. Convert ke numpy
    4. Normalize ke range [-1, 1]
    5. Add batch dimension

    Output shape:
    (1, 224, 224, 3)
    """
    size = settings.ml_image_size

    img = load_image_from_bytes(image_bytes)

    img = img.resize(
        (size, size),
        Image.LANCZOS,
    )

    arr = np.array(img, dtype=np.float32)

    # MobileNetV2: pixel range [0,255] → [-1,1]
    arr = (arr / 127.5) - 1.0

    # (224,224,3) → (1,224,224,3)
    arr = np.expand_dims(arr, axis=0)

    if settings.is_development:
        print("====================================")
        print("[ML] PREPROCESS SUCCESS")
        print("====================================")
        print("SHAPE:", arr.shape)
        print("DTYPE:", arr.dtype)
        print("MIN:", arr.min())
        print("MAX:", arr.max())
        print("====================================")

    return arr


# =========================================================
# VALIDATE IMAGE
# =========================================================
def validate_image(
    image_bytes: bytes,
    content_type: str,
) -> Tuple[bool, str]:
    """
    Validasi image upload.

    Validation:
    - content type (via list, bukan substring)
    - max size
    - valid image (via PIL verify pada instance terpisah)
    """

    # Content type — pakai list, bukan string
    if content_type not in settings.allowed_image_types_list:
        return (
            False,
            f"Tipe file tidak didukung: {content_type}",
        )

    # File size
    if len(image_bytes) > settings.max_upload_size_bytes:
        return (
            False,
            f"Ukuran file melebihi {settings.max_upload_size_mb}MB",
        )

    # FIX: Buka Image baru khusus untuk verify(), terpisah dari instance
    # yang akan dipakai preprocess(). Setelah verify() dipanggil, PIL
    # menandai file internal sudah dikonsumsi — objek tidak bisa digunakan
    # untuk operasi lanjutan (resize, convert, dll).
    try:
        verify_img = Image.open(io.BytesIO(image_bytes))
        verify_img.verify()
    except Exception as e:
        if settings.is_development:
            print("====================================")
            print("[ML] INVALID IMAGE")
            print(str(e))
            print("====================================")
        return (
            False,
            "File bukan gambar yang valid",
        )

    return (True, "")