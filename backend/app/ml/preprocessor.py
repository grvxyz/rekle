import io
from typing import Tuple

import numpy as np
from PIL import Image
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

from app.core.config import settings


def load_image_from_bytes(image_bytes: bytes) -> Image.Image:
    """Ubah bytes upload menjadi PIL Image."""
    return Image.open(io.BytesIO(image_bytes)).convert("RGB")


def preprocess(image_bytes: bytes) -> np.ndarray:
    """
    Preprocessing gambar untuk MobileNetV2.

    Sesuai notebook training (preprocessing_function=preprocess_input):
      1. Load image dari bytes
      2. Resize ke 224x224
      3. Convert ke numpy float32
      4. Normalisasi dengan preprocess_input (range [-1, 1])
      5. Add batch dimension -> (1, 224, 224, 3)
    """
    size = settings.ml_image_size

    img = load_image_from_bytes(image_bytes)
    img = img.resize((size, size), Image.LANCZOS)

    arr = np.array(img, dtype=np.float32)
    arr = preprocess_input(arr)
    arr = np.expand_dims(arr, axis=0)

    if settings.is_development:
        print("====================================")
        print("[ML] PREPROCESS SUCCESS")
        print("====================================")
        print("SHAPE:", arr.shape)
        print("DTYPE:", arr.dtype)
        print("MIN  :", arr.min())
        print("MAX  :", arr.max())
        print("====================================")

    return arr


def validate_image(
    image_bytes: bytes,
    content_type: str,
) -> Tuple[bool, str]:
    """
    Validasi image upload:
    - content type (list membership, bukan substring)
    - max file size
    - file valid sebagai image (PIL verify)
    """

    if content_type not in settings.allowed_image_types_list:
        return (
            False,
            f"Tipe file tidak didukung: {content_type}. "
            f"Gunakan: {', '.join(settings.allowed_image_types_list)}",
        )

    if len(image_bytes) > settings.max_upload_size_bytes:
        return (
            False,
            f"Ukuran file melebihi {settings.max_upload_size_mb}MB",
        )

    try:
        verify_img = Image.open(io.BytesIO(image_bytes))
        verify_img.verify()
    except Exception as e:
        if settings.is_development:
            print("====================================")
            print("[ML] INVALID IMAGE")
            print(str(e))
            print("====================================")
        return (False, "File bukan gambar yang valid")

    return (True, "")