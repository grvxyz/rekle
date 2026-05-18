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
from app.ml.preprocessor import validate_image
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

_model: Optional[tf.keras.Model] = None


def get_model() -> tf.keras.Model:
    global _model
    if _model is None:
        print(f"[ModelService] Loading model dari: {settings.ml_model_path}")
        _model = tf.keras.models.load_model(settings.ml_model_path)
        print("[ModelService] Model siap digunakan.")
    return _model


def _preprocess(image_bytes: bytes) -> np.ndarray:
    """Resize + normalisasi gambar untuk MobileNetV2 (sesuai notebook)."""
    size = settings.ml_image_size
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize((size, size), Image.LANCZOS)
    arr = np.array(img, dtype=np.float32)
    arr = preprocess_input(arr)
    return np.expand_dims(arr, axis=0)


def _save_image(image_bytes: bytes, content_type: str) -> str:
    """Simpan gambar ke UPLOAD_DIR, kembalikan path."""
    ext = (content_type or "image/jpeg").split("/")[-1]
    filename = f"{uuid.uuid4().hex}.{ext}"
    os.makedirs(settings.upload_dir, exist_ok=True)
    filepath = os.path.join(settings.upload_dir, filename)
    with open(filepath, "wb") as f:
        f.write(image_bytes)
    return filepath


async def predict_image(file: UploadFile) -> dict:
    """
    Pipeline lengkap untuk endpoint POST /predict/:
      1. Baca bytes dari UploadFile
      2. Validasi tipe dan ukuran
      3. Preprocessing
      4. Inferensi model
      5. Confidence check: threshold (0.7) + gap (0.2) sesuai notebook
      6. Mapping ke rekomendasi
      7. Simpan gambar
      8. Kembalikan hasil terstruktur termasuk top-2 dan gap
    """
    # 1. Baca file
    image_bytes = await file.read()
    content_type = file.content_type or "image/jpeg"

    # 2. Validasi
    is_valid, error_msg = validate_image(image_bytes, content_type)
    if not is_valid:
        return {"success": False, "error": error_msg}

    # 3. Preprocessing + inferensi
    try:
        model = get_model()
        input_array = _preprocess(image_bytes)
        raw_output = model.predict(input_array, verbose=0)
        scores = raw_output[0].tolist()
    except Exception as e:
        return {"success": False, "error": f"Gagal memproses gambar: {str(e)}"}

    # 4. Petakan skor ke label
    labels = settings.ml_class_labels_list
    all_scores = {lbl: round(float(s), 4) for lbl, s in zip(labels, scores)}

    # 5. Top-2 (sesuai notebook)
    top2_indices = np.argsort(scores)[-2:][::-1]
    top2 = [
        {"label": labels[i], "confidence": round(float(scores[i]), 4)}
        for i in top2_indices
    ]

    best_idx = int(top2_indices[0])
    result_label = labels[best_idx]
    confidence = round(float(scores[best_idx]), 4)

    # 6. Confidence check: threshold + gap (sesuai notebook)
    sorted_scores = sorted(scores, reverse=True)
    gap = round(sorted_scores[0] - sorted_scores[1], 4)

    is_confident = (
        confidence >= settings.ml_confidence_threshold
        and gap >= settings.ml_confidence_gap_threshold
    )

    if not is_confident:
        result_label = "Tidak dikenali"

    # 7. Rekomendasi aksi
    recommendation = get_full_recommendation(result_label) if is_confident else {
        "action_type": None,
        "label": "Tidak dikenali",
        "description": "Gambar tidak dapat dikenali. Coba foto ulang.",
        "icon": "unknown",
        "can_self": False,
    }

    # 8. Simpan gambar
    image_path = _save_image(image_bytes, content_type)

    return {
        "success": True,
        "result": result_label,
        "confidence": confidence,
        "gap": gap,
        "is_confident": is_confident,
        "recommendation": recommendation,
        "all_scores": all_scores,
        "top2": top2,
        "image_path": image_path,
    }