import io
from typing import Tuple

import numpy as np
from PIL import Image

from app.core.config import settings


def load_image_from_bytes(image_bytes: bytes) -> Image.Image:
    """Buka bytes hasil upload menjadi objek PIL Image."""
    return Image.open(io.BytesIO(image_bytes)).convert("RGB")


def preprocess(image_bytes: bytes) -> np.ndarray:
    """
    Pipeline preprocessing untuk MobileNetV2:
    1. Buka gambar dari bytes
    2. Resize ke 224x224
    3. Normalisasi pixel ke [-1, 1] (sesuai MobileNetV2 preprocess_input)
    4. Tambah batch dimension → shape (1, 224, 224, 3)
    """
    size = settings.ml_image_size  # 224

    img = load_image_from_bytes(image_bytes)
    img = img.resize((size, size), Image.LANCZOS)

    arr = np.array(img, dtype=np.float32)

    # MobileNetV2 pakai preprocess_input dari keras, range [-1, 1]
    arr = (arr / 127.5) - 1.0

    # Tambah batch dimension: (224, 224, 3) → (1, 224, 224, 3)
    return np.expand_dims(arr, axis=0)


def validate_image(image_bytes: bytes, content_type: str) -> Tuple[bool, str]:
    """
    Validasi file sebelum diproses:
    - Cek content type
    - Cek ukuran file
    - Cek bisa dibuka sebagai gambar
    """
    if content_type not in settings.allowed_image_types:
        return False, f"Tipe file tidak didukung: {content_type}"

    if len(image_bytes) > settings.max_upload_size_bytes:
        return False, f"Ukuran file melebihi {settings.max_upload_size_mb}MB"

    try:
        img = load_image_from_bytes(image_bytes)
        img.verify()
    except Exception:
        return False, "File bukan gambar yang valid"

    return True, ""