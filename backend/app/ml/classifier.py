from typing import Dict, Tuple

from pathlib import Path

import numpy as np
import tensorflow as tf

from app.core.config import settings
from app.ml.preprocessor import preprocess

# =========================================================
# MODEL CACHE
# =========================================================
# model hanya diload sekali saat startup
_model: tf.keras.Model | None = None

# =========================================================
# MODEL PATH
# =========================================================
MODEL_PATH = Path(
    settings.ml_model_path
)

# =========================================================
# LOAD MODEL
# =========================================================
def get_model() -> tf.keras.Model:

    global _model

    if _model is None:

        print("====================================")
        print("[ML] Loading Model")
        print("====================================")

        print("MODEL PATH:")
        print(MODEL_PATH)

        print()

        print(
            "FILE EXISTS:",
            MODEL_PATH.exists()
        )

        print("====================================")

        # cek file model
        if not MODEL_PATH.exists():
            raise FileNotFoundError(
                f"""
Model tidak ditemukan.

Path:
{MODEL_PATH}

Pastikan file:
REKLE_MobileNetV2_Final.keras

berada di folder:
app/ml/
"""
            )

        # load tensorflow model
        _model = tf.keras.models.load_model(
            MODEL_PATH
        )

        print("[ML] Model berhasil dimuat.")

    return _model

# =========================================================
# PREDICT
# =========================================================
def predict(
    image_bytes: bytes
) -> Tuple[
    str,
    float,
    Dict[str, float],
    bool
]:
    """
    Jalankan inferensi AI.

    Returns:
        label
        confidence
        all_scores
        is_confident
    """

    # =========================
    # LOAD MODEL
    # =========================
    model = get_model()

    # =========================
    # LABELS
    # =========================
    labels = (
        settings.ml_class_labels_list
    )

    # =========================
    # PREPROCESS IMAGE
    # =========================
    input_array = preprocess(
        image_bytes
    )

    # shape:
    # (1, 224, 224, 3)

    # =========================
    # PREDICTION
    # =========================
    raw_output = model.predict(
        input_array,
        verbose=0,
    )

    # shape:
    # (1, num_classes)

    scores = raw_output[0].tolist()

    # =========================
    # ALL SCORES
    # =========================
    all_scores: Dict[str, float] = {
        label: round(
            float(score),
            4,
        )
        for label, score in zip(
            labels,
            scores,
        )
    }

    # =========================
    # BEST PREDICTION
    # =========================
    best_idx = int(
        np.argmax(scores)
    )

    label = labels[best_idx]

    confidence = round(
        float(scores[best_idx]),
        4,
    )

    # =========================
    # CONFIDENCE CHECK
    # =========================
    is_confident = (
        confidence >=
        settings.ml_confidence_threshold
    )

    # =========================
    # DEBUG
    # =========================
    print("====================================")
    print("[ML] Prediction Success")
    print("====================================")

    print("LABEL:")
    print(label)

    print()

    print("CONFIDENCE:")
    print(confidence)

    print()

    print("ALL SCORES:")
    print(all_scores)

    print("====================================")

    return (
        label,
        confidence,
        all_scores,
        is_confident,
    )

# =========================================================
# PREDICT FROM FILE PATH
# =========================================================
def predict_from_path(
    image_path: str
):
    """
    Helper untuk testing lokal.
    """

    with open(image_path, "rb") as f:
        return predict(
            f.read()
        )