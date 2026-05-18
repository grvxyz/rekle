from typing import Dict, List, Tuple
from pathlib import Path

import numpy as np
import tensorflow as tf

from app.core.config import settings
from app.ml.preprocessor import preprocess

_model: tf.keras.Model | None = None

MODEL_PATH = Path(settings.ml_model_path)


def get_model() -> tf.keras.Model:

    global _model

    if _model is None:

        print("====================================")
        print("[ML] Loading Model")
        print("====================================")
        print("MODEL PATH:")
        print(MODEL_PATH)
        print()
        print("FILE EXISTS:", MODEL_PATH.exists())
        print("====================================")

        if not MODEL_PATH.exists():
            raise FileNotFoundError(
                f"""
Model tidak ditemukan.

Path:
{MODEL_PATH}

Pastikan file hasil training notebook (mobilenet_final.keras)
berada di folder: app/ml/
"""
            )

        _model = tf.keras.models.load_model(MODEL_PATH)
        print("[ML] Model berhasil dimuat.")

    return _model


def predict(
    image_bytes: bytes,
) -> Tuple[
    str,
    float,
    Dict[str, float],
    bool,
    List[Dict],
]:
    """
    Inferensi AI dengan logika confidence sesuai notebook:
      - is_confident = True hanya jika:
          (1) confidence >= ml_confidence_threshold  (0.7)
          (2) gap top-1 vs top-2 >= ml_confidence_gap_threshold (0.2)
      - Jika tidak memenuhi -> label = "Tidak dikenali"

    Returns:
        label        : kategori sampah
        confidence   : skor top-1 (0-1)
        all_scores   : dict semua kelas
        is_confident : bool
        top2         : list 2 prediksi teratas [{label, confidence}]
    """

    model = get_model()
    labels = settings.ml_class_labels_list

    input_array = preprocess(image_bytes)

    raw_output = model.predict(input_array, verbose=0)
    scores = raw_output[0].tolist()

    all_scores: Dict[str, float] = {
        lbl: round(float(s), 4)
        for lbl, s in zip(labels, scores)
    }

    top2_indices = np.argsort(scores)[-2:][::-1]
    top2: List[Dict] = [
        {
            "label": labels[i],
            "confidence": round(float(scores[i]), 4),
        }
        for i in top2_indices
    ]

    best_idx = int(top2_indices[0])
    label = labels[best_idx]
    confidence = round(float(scores[best_idx]), 4)

    sorted_scores = sorted(scores, reverse=True)
    gap = round(sorted_scores[0] - sorted_scores[1], 4)

    is_confident = (
        confidence >= settings.ml_confidence_threshold
        and gap >= settings.ml_confidence_gap_threshold
    )

    if not is_confident:
        label = "Tidak dikenali"

    if settings.is_development:
        print("====================================")
        print("[ML] Prediction Result")
        print("====================================")
        print("LABEL    :", label)
        print("CONFIDENCE:", confidence)
        print("GAP      :", gap)
        print("IS_CONF  :", is_confident)
        print("TOP-2    :", top2)
        print("ALL      :", all_scores)
        print("====================================")

    return label, confidence, all_scores, is_confident, top2


def predict_from_path(image_path: str):
    """Helper untuk testing lokal."""
    with open(image_path, "rb") as f:
        return predict(f.read())