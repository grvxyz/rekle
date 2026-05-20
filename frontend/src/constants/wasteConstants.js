// ============================================================
// src/constants/wasteConstants.js
// Sinkron dengan app/ml/recommendation.py dan config.py
// ============================================================

// ─── Label tampilan per kategori ML ────────────────────────
export const CATEGORY_LABEL = {
  organik:          "Sampah Organik",
  plastik_pet:      "Plastik PET",
  plastik_hdpe:     "Plastik HDPE",
  plastik_campuran: "Plastik Campuran",
  kertas_bersih:    "Kertas Bersih",
  kertas_kotor:     "Kertas Kotor",
  kaca_utuh:        "Kaca Utuh",
  kaca_pecah:       "Kaca Pecah",
};

// ─── Rekomendasi aksi utama per kategori ───────────────────
// Sinkron dengan app/ml/recommendation.py _RECOMMENDATION_MAP
export const RECOMMENDATION_MAP = {
  organik:          "kompos",
  plastik_pet:      "daur_ulang",
  plastik_hdpe:     "daur_ulang",
  plastik_campuran: "eco_brick",
  kertas_bersih:    "daur_ulang",
  kertas_kotor:     "tidak_layak",
  kaca_utuh:        "reuse",
  kaca_pecah:       "khusus",
};

// ─── Ide reuse per kategori ────────────────────────────────
export const REUSE_TIPS = {
  organik: [
    "Jadikan pupuk kompos untuk tanaman rumah.",
    "Buat eco-enzyme dari sisa buah dan sayuran.",
    "Gunakan sebagai pakan ternak atau ikan.",
  ],
  plastik_pet: [
    "Botol PET bisa dijadikan pot tanaman gantung.",
    "Buat tempat pensil atau organizer meja dari botol.",
    "Rangkai menjadi hidroponik sederhana di rumah.",
  ],
  plastik_hdpe: [
    "Wadah HDPE bisa dipakai ulang sebagai tempat penyimpanan.",
    "Buat lubang drainase mini untuk pot tanaman.",
    "Jadikan wadah benih tanaman atau seedling.",
  ],
  plastik_campuran: [
    "Padatkan dalam botol plastik menjadi eco brick.",
    "Gunakan sebagai pengisi bantalan atau dekorasi.",
    "Buat bata ramah lingkungan untuk proyek kecil.",
  ],
  kertas_bersih: [
    "Lipat menjadi origami atau dekorasi dinding.",
    "Jadikan bungkus kado atau pelapis buku.",
    "Buat kertas daur ulang manual di rumah.",
  ],
  kertas_kotor: [
    "Kertas kotor sulit dipakai ulang — buang ke sampah residu.",
    "Jika hanya sedikit kotor, keringkan lalu setor ke bank sampah.",
  ],
  kaca_utuh: [
    "Botol kaca bisa dijadikan vas bunga unik.",
    "Jadikan tempat lilin atau lampu hias.",
    "Gunakan kembali sebagai wadah penyimpanan bumbu.",
  ],
  kaca_pecah: [
    "Kaca pecah berbahaya — bungkus rapat dengan koran sebelum dibuang.",
    "Jangan campurkan dengan sampah lain tanpa pelindung.",
    "Hubungi mitra khusus penanganan kaca pecah.",
  ],
};

export const DEFAULT_TIPS = [
  "Pilah sampah berdasarkan jenisnya.",
  "Bersihkan sampah sebelum diproses ulang.",
  "Cari inspirasi kerajinan daur ulang di media sosial.",
];

// ─── Info daur ulang per kategori ─────────────────────────
export const RECYCLE_INFO = {
  organik: {
    desc: "Sampah organik dapat diolah menjadi kompos yang bermanfaat untuk pertanian dan taman.",
    steps: [
      "Pisahkan sampah organik dari jenis sampah lain.",
      "Kumpulkan dalam wadah kompos atau lubang kompos.",
      "Tambahkan sekam atau tanah setiap lapisan untuk mempercepat dekomposisi.",
      "Setor ke bank sampah mitra yang menerima organik jika tidak bisa kompos sendiri.",
    ],
  },
  plastik_pet: {
    desc: "Plastik PET (kode segitiga 1) adalah salah satu plastik paling bernilai untuk didaur ulang.",
    steps: [
      "Cuci bersih botol PET dari sisa minuman.",
      "Lepas tutup dan label jika memungkinkan.",
      "Pipihkan atau padatkan untuk menghemat ruang.",
      "Setor ke bank sampah atau mitra daur ulang plastik.",
    ],
  },
  plastik_hdpe: {
    desc: "Plastik HDPE (kode 2) seperti galon dan jerigen memiliki nilai jual yang baik di bank sampah.",
    steps: [
      "Bilas wadah HDPE hingga bersih.",
      "Kumpulkan dalam karung atau wadah besar.",
      "Setor ke bank sampah atau pengepul plastik terdekat.",
    ],
  },
  plastik_campuran: {
    desc: "Plastik campuran sulit didaur ulang secara langsung, tetapi bisa dijadikan eco brick.",
    steps: [
      "Potong kecil-kecil plastik campuran.",
      "Padatkan ke dalam botol plastik menggunakan tongkat.",
      "Serahkan eco brick ke mitra pembuat bata atau bangunan komunitas.",
    ],
  },
  kertas_bersih: {
    desc: "Kertas bersih dan kering memiliki nilai tinggi untuk didaur ulang menjadi kertas baru.",
    steps: [
      "Pastikan kertas dalam kondisi kering dan tidak berminyak.",
      "Pisahkan dari kertas kotor, tisu, atau karton berlapis.",
      "Ikat menjadi bundel atau masukkan dalam karung.",
      "Setor ke bank sampah atau pengepul kertas.",
    ],
  },
  kertas_kotor: {
    desc: "Kertas kotor atau basah umumnya tidak dapat didaur ulang — masuk ke sampah residu.",
    steps: [
      "Keringkan jika hanya lembab — mungkin masih bisa diproses.",
      "Jika terkontaminasi minyak atau makanan, buang ke tempat sampah residu.",
      "Jangan campurkan kertas kotor dengan kertas bersih saat menyetor.",
    ],
  },
  kaca_utuh: {
    desc: "Kaca utuh dapat dijual ke pengepul atau diberikan ke fasilitas daur ulang kaca.",
    steps: [
      "Bersihkan botol atau pecahan kaca dari sisa isi.",
      "Kumpulkan dalam wadah keras (kardus berlapis).",
      "Setor ke bank sampah yang menerima kaca atau pengepul kaca.",
    ],
  },
  kaca_pecah: {
    desc: "Kaca pecah membutuhkan penanganan khusus agar tidak membahayakan petugas.",
    steps: [
      "Bungkus rapat dengan beberapa lapis koran atau kardus.",
      "Rekatkan dengan lakban dan beri label 'KACA PECAH'.",
      "Hubungi mitra khusus atau dinas kebersihan setempat.",
      "Jangan buang bersama sampah plastik atau kertas biasa.",
    ],
  },
};

export const DEFAULT_INFO = {
  desc: "Sampah ini dapat diproses melalui fasilitas daur ulang setempat.",
  steps: [
    "Bersihkan sampah dari kotoran atau sisa makanan.",
    "Pisahkan berdasarkan jenisnya.",
    "Setor ke bank sampah atau mitra daur ulang terdekat.",
  ],
};