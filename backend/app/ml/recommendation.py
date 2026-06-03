from typing import Dict, Optional

# ─── Mapping label → kode aksi ─────────────────────────────
# Label sesuai app/ml/class_names.json (9 kelas)

_RECOMMENDATION_MAP: Dict[str, Optional[str]] = {
    "organik":    "kompos",
    "Plastik":    "daur_ulang",
    "Kertas":     "daur_ulang",
    "Kardus":     "daur_ulang",
    "Kaca":       "reuse",
    "Logam":      "daur_ulang",
    "B3":         "khusus",
    "Medis":      "khusus",
    "nonsampah":  None,          # bukan sampah, tidak ada aksi
}

# ─── Detail per jenis aksi ─────────────────────────────────

_ACTION_DETAIL: Dict[str, Dict] = {
    "kompos": {
        "label":       "Buat kompos",
        "description": "Sampah organik bisa diolah menjadi pupuk kompos di rumah.",
        "icon":        "compost",
        "can_self":    True,
    },
    "daur_ulang": {
        "label":       "Daur ulang",
        "description": "Kirim ke bank sampah atau mitra daur ulang terdekat.",
        "icon":        "recycle",
        "can_self":    False,
    },
    "reuse": {
        "label":       "Gunakan kembali",
        "description": "Masih bisa digunakan kembali atau dijual ke pengepul.",
        "icon":        "reuse",
        "can_self":    True,
    },
    "khusus": {
        "label":       "Penanganan khusus",
        "description": "Limbah ini memerlukan penanganan khusus. "
                       "Jangan buang sembarangan — serahkan ke fasilitas pengelola limbah B3/medis.",
        "icon":        "warning",
        "can_self":    False,
    },
}


def get_recommendation(label: str) -> Optional[str]:
    """
    Kembalikan kode aksi dari label klasifikasi.
    Contoh: "Plastik" → "daur_ulang"
    Kembalikan None jika label = "nonsampah" atau tidak dikenal.
    """
    # Eksplisit cek — label dikenal tapi tidak punya aksi (nonsampah)
    if label in _RECOMMENDATION_MAP:
        return _RECOMMENDATION_MAP[label]
    return None


def get_action_detail(action_type: str) -> Optional[Dict]:
    """Kembalikan detail lengkap untuk satu jenis aksi."""
    return _ACTION_DETAIL.get(action_type)


def get_full_recommendation(label: str) -> Optional[Dict]:
    """
    Kembalikan rekomendasi lengkap: kode aksi + detail.
    Kembalikan None jika label = "nonsampah" atau tidak dikenal.
    Dipakai langsung oleh scan endpoint dan classifier service.
    """
    action_type = get_recommendation(label)

    # nonsampah atau label tidak dikenal → tidak ada rekomendasi
    if action_type is None:
        return None

    detail = get_action_detail(action_type) or {}
    return {
        "action_type": action_type,
        **detail,
    }