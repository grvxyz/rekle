import json
from typing import Dict, Tuple

import numpy as np
import tensorflow as tf

from app.core.config import settings
from app.ml.preprocessor import preprocess

# ─── Load model sekali saat startup ────────────────────────
# Disimpan di module-level agar tidak reload setiap request
_model: tf.keras.Model | None = None


def get_model() -> tf.keras.Model:
    global _model
    if _model is None:
        print(f"[ML] Loading model dari {settings.ml_model_path}...")
        _model = tf.keras.models.load_model(settings.ml_model_path)
        print("[ML] Model berhasil dimuat.")
    return _model


# ─── Inferensi ─────────────────────────────────────────────

def predict(image_bytes: bytes) -> Tuple[str, float, Dict[str, float], bool]:
    """
    Jalankan inferensi pada gambar.

    Returns:
        label       : kategori dengan confidence tertinggi, misal "plastik_pet"
        confidence  : nilai confidence 0.0 - 1.0
        all_scores  : dict semua label → confidence
        is_confident: True jika confidence >= threshold dari config
    """
    model = get_model()
    labels = settings.ml_class_labels

    input_array = preprocess(image_bytes)           # shape (1, 224, 224, 3)
    raw_output = model.predict(input_array)         # shape (1, n_classes)
    scores = raw_output[0].tolist()                 # list float per kelas

    all_scores: Dict[str, float] = {
        label: round(float(score), 4)
        for label, score in zip(labels, scores)
    }

    best_idx = int(np.argmax(scores))
    label = labels[best_idx]
    confidence = round(float(scores[best_idx]), 4)
    is_confident = confidence >= settings.ml_confidence_threshold

    return label, confidence, all_scores, is_confident


def predict_from_path(image_path: str) -> Tuple[str, float, Dict[str, float], bool]:
    """Wrapper untuk predict dari file path (berguna untuk testing)."""
    with open(image_path, "rb") as f:
        return predict(f.read())