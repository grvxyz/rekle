import json
import os
import uuid
from typing import Optional

import numpy as np
import tensorflow as tf
from fastapi import UploadFile
from PIL import Image
import io

from app.core.config import settings
from app.ml.recommendation import get_full_recommendation

# ─── Load model sekali saat startup ────────────────────────
_model: Optional[tf.keras.Model] = None


def get_model() -> tf.keras.Model:
    global _model
    if _model is None:
        print(f"[ModelService] Loading model dari: {settings.ml_model_path}")
        _model = tf.keras.models.load_model(settings.ml_model_path)
        print("[ModelService] Model siap digunakan.")
    return _model


# ─── Preprocessing ─────────────────────────────────────────

def _preprocess(image_bytes: bytes) -> np.ndarray:
    """Resize + normalisasi gambar untuk MobileNetV2."""
    size = settings.ml_image_size  # 224
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize((size, size), Image.LANCZOS)
    arr = np.array(img, dtype=np.float32)
    arr = (arr / 127.5) - 1.0                    # normalisasi ke [-1, 1]
    return np.expand_dims(arr, axis=0)            # (1, 224, 224, 3)


# ─── Save image ────────────────────────────────────────────

def _save_image(image_bytes: bytes, content_type: str) -> str:
    """Simpan gambar ke UPLOAD_DIR, kembalikan path."""
    ext = (content_type or "image/jpeg").split("/")[-1]
    filename = f"{uuid.uuid4().hex}.{ext}"
    os.makedirs(settings.upload_dir, exist_ok=True)
    filepath = os.path.join(settings.upload_dir, filename)
    with open(filepath, "wb") as f:
        f.write(image_bytes)
    return filepath


# ─── Core predict function ─────────────────────────────────

async def predict_image(file: UploadFile) -> dict:
    """
    Pipeline lengkap:
    1. Baca bytes dari UploadFile
    2. Validasi tipe file
    3. Preprocessing
    4. Inferensi model
    5. Mapping ke rekomendasi
    6. Simpan gambar
    7. Kembalikan hasil terstruktur

    Dipanggil dari endpoint POST /predict/
    """
    # 1. Baca file
    image_bytes = await file.read()
    content_type = file.content_type or "image/jpeg"

    # 2. Validasi tipe
    if content_type not in settings.allowed_image_types:
        return {
            "success": False,
            "error": f"Tipe file tidak didukung: {content_type}. "
                     f"Gunakan: {', '.join(settings.allowed_image_types)}"
        }

    # 3. Validasi ukuran
    if len(image_bytes) > settings.max_upload_size_bytes:
        return {
            "success": False,
            "error": f"Ukuran file melebihi {settings.max_upload_size_mb}MB"
        }

    # 4. Preprocessing + inferensi
    try:
        model = get_model()
        input_array = _preprocess(image_bytes)
        raw_output = model.predict(input_array, verbose=0)
        scores = raw_output[0].tolist()
    except Exception as e:
        return {"success": False, "error": f"Gagal memproses gambar: {str(e)}"}

    # 5. Petakan skor ke label
    labels = settings.ml_class_labels
    all_scores = {label: round(float(s), 4) for label, s in zip(labels, scores)}
    best_idx = int(np.argmax(scores))
    result_label = labels[best_idx]
    confidence = round(float(scores[best_idx]), 4)
    is_confident = confidence >= settings.ml_confidence_threshold

    # 6. Rekomendasi aksi
    recommendation = get_full_recommendation(result_label)

    # 7. Simpan gambar
    image_path = _save_image(image_bytes, content_type)

    return {
        "success": True,
        "result": result_label,
        "confidence": confidence,
        "is_confident": is_confident,
        "recommendation": recommendation,
        "all_scores": all_scores,
        "image_path": image_path,
    }