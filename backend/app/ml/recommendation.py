from typing import Dict, Optional

# ─── Mapping kategori → rekomendasi aksi ───────────────────
# Sesuai flow diagram: setiap kategori punya aksi utama yang disarankan

_RECOMMENDATION_MAP: Dict[str, str] = {
    "organik":          "kompos",
    "plastik_pet":      "daur_ulang",
    "plastik_hdpe":     "daur_ulang",
    "plastik_campuran": "eco_brick",
    "kertas_bersih":    "daur_ulang",
    "kertas_kotor":     "tidak_layak",
    "kaca_utuh":        "reuse",
    "kaca_pecah":       "khusus",
}

# Detail penjelasan per rekomendasi (ditampilkan ke user)
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
    "eco_brick": {
        "label":       "Eco brick",
        "description": "Plastik campuran bisa dijadikan eco brick sebagai material bangunan.",
        "icon":        "eco_brick",
        "can_self":    True,
    },
    "reuse": {
        "label":       "Gunakan kembali",
        "description": "Kaca utuh masih bisa digunakan atau dijual ke pengepul.",
        "icon":        "reuse",
        "can_self":    True,
    },
    "tidak_layak": {
        "label":       "Tidak layak daur ulang",
        "description": "Kertas kotor/basah tidak bisa didaur ulang, buang ke sampah residu.",
        "icon":        "trash",
        "can_self":    False,
    },
    "khusus": {
        "label":       "Penanganan khusus",
        "description": "Kaca pecah berbahaya, bungkus rapat sebelum dibuang.",
        "icon":        "warning",
        "can_self":    False,
    },
}


def get_recommendation(label: str) -> Optional[str]:
    """
    Kembalikan kode aksi dari label klasifikasi.
    Contoh: "plastik_pet" → "daur_ulang"
    """
    return _RECOMMENDATION_MAP.get(label)


def get_action_detail(action_type: str) -> Optional[Dict]:
    """Kembalikan detail lengkap untuk satu jenis aksi."""
    return _ACTION_DETAIL.get(action_type)


def get_full_recommendation(label: str) -> Dict:
    """
    Kembalikan rekomendasi lengkap: kode aksi + detail.
    Dipakai langsung oleh scan endpoint.
    """
    action_type = get_recommendation(label) or "khusus"
    detail = get_action_detail(action_type) or {}
    return {
        "action_type": action_type,
        **detail,
    }