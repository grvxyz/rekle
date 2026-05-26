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

// ─── Action type per route path ────────────────────────────
// Dipakai ActionPage untuk routing dengan action_type yang benar
export const ACTION_ROUTE_MAP = {
  kompos:     "/action/kompos",
  daur_ulang: "/action/recycle",
  eco_brick:  "/action/eco-brick",
  reuse:      "/action/reuse",
  khusus:     "/action/khusus",
  bank_sampah:"/action/bank-sampah",
};

// ─── Info panduan per aksi ─────────────────────────────────
export const RECYCLE_INFO = {
  organik: {
    desc: "Sampah organik bisa diolah menjadi kompos kaya nutrisi—bukan sekadar dibuang.",
    steps: [
      "Pisahkan sampah organik dari plastik, kaca, dan logam.",
      "Kumpulkan dalam wadah kompos atau lubang kompos di tanah.",
      "Tambahkan sekam, daun kering, atau tanah setiap lapisan.",
      "Aduk seminggu sekali. Kompos siap dalam 4–8 minggu.",
      "Kalau tidak punya lahan, setor ke mitra bank sampah yang menerima organik.",
    ],
  },
  plastik_pet: {
    desc: "Plastik PET (kode 1, botol minuman) adalah salah satu plastik paling dicari bank sampah—nilainya lumayan.",
    steps: [
      "Cuci bersih botol dari sisa minuman dan label jika bisa dilepas.",
      "Pipihkan untuk menghemat ruang penyimpanan.",
      "Kumpulkan minimal 5 kg agar lebih efisien saat disetor.",
      "Setor ke bank sampah atau pengepul plastik terdekat.",
    ],
  },
  plastik_hdpe: {
    desc: "Plastik HDPE (kode 2, galon dan jerigen) punya nilai jual yang baik dan mudah diterima pengepul.",
    steps: [
      "Bilas hingga bersih dan keringkan.",
      "Lepas tutup—tutup dan badan bisa diterima secara terpisah.",
      "Kumpulkan dalam karung dan setor ke bank sampah.",
    ],
  },
  plastik_campuran: {
    desc: "Plastik campuran sulit didaur ulang langsung, tapi bisa jadi eco brick—material bangunan alternatif.",
    steps: [
      "Cuci dan keringkan plastik, lalu potong kecil-kecil.",
      "Padatkan ke dalam botol plastik 600 ml menggunakan tongkat.",
      "Satu botol penuh = satu eco brick yang siap dipakai.",
      "Serahkan ke komunitas eco brick atau proyek bangunan lokal.",
    ],
  },
  kertas_bersih: {
    desc: "Kertas bersih dan kering punya nilai tinggi—1 kg kertas bisa menghemat setengah pohon dari penebangan.",
    steps: [
      "Pastikan kertas kering dan tidak berminyak.",
      "Pisahkan kertas putih, karton, dan kardus—harganya beda.",
      "Ikat menjadi bundel rapi, berat minimal 1 kg per ikat.",
      "Setor ke bank sampah atau langsung ke pengepul kertas.",
    ],
  },
  kertas_kotor: {
    desc: "Kertas yang terkontaminasi minyak atau makanan tidak bisa didaur ulang—harus ke residu.",
    steps: [
      "Periksa: jika hanya sedikit lembab, keringkan dulu di bawah matahari.",
      "Kertas berminyak (bungkus gorengan, tisu berminyak) → langsung residu.",
      "Jangan campurkan dengan kertas bersih saat menyetor ke bank sampah.",
    ],
  },
  kaca_utuh: {
    desc: "Botol dan wadah kaca utuh bisa dipakai ulang atau dijual ke pengepul—kaca bisa didaur ulang 100%.",
    steps: [
      "Cuci bersih dari sisa isi.",
      "Kumpulkan dalam kardus atau kotak keras agar aman.",
      "Setor ke bank sampah yang menerima kaca—cek terlebih dahulu.",
    ],
  },
  kaca_pecah: {
    desc: "Kaca pecah butuh penanganan ekstra hati-hati—salah langkah bisa melukai petugas sampah.",
    steps: [
      "Kumpulkan pecahan menggunakan sarung tangan tebal.",
      "Bungkus berlapis koran atau kardus tebal.",
      "Rekatkan rapat dengan lakban dan tulis 'KACA PECAH—BERBAHAYA' di luar.",
      "Hubungi dinas kebersihan atau mitra khusus untuk penjemputan.",
    ],
  },
};

export const DEFAULT_INFO = {
  desc: "Sampah ini dapat diproses melalui fasilitas daur ulang setempat.",
  steps: [
    "Bersihkan dari kotoran atau sisa makanan.",
    "Pilah berdasarkan jenisnya.",
    "Setor ke bank sampah atau mitra daur ulang terdekat.",
  ],
};

// ─── Tips reuse per kategori ────────────────────────────────
export const REUSE_TIPS = {
  organik: [
    "Jadikan pupuk kompos untuk tanaman rumah atau kebun.",
    "Buat eco-enzyme dari sisa buah—bisa jadi pembersih alami.",
    "Gunakan sebagai pakan ternak atau ikan jika memungkinkan.",
  ],
  plastik_pet: [
    "Botol PET bisa dijadikan pot tanaman gantung yang unik.",
    "Buat tempat pensil atau organizer meja dari botol bekas.",
    "Rangkai menjadi sistem hidroponik sederhana di rumah.",
  ],
  plastik_hdpe: [
    "Wadah HDPE bisa dipakai ulang sebagai tempat penyimpanan benih.",
    "Buat lubang drainase mini untuk pot tanaman.",
    "Jadikan wadah seedling atau persemaian.",
  ],
  plastik_campuran: [
    "Padatkan dalam botol plastik menjadi eco brick.",
    "Gunakan sebagai pengisi bantalan atau dekorasi.",
  ],
  kertas_bersih: [
    "Lipat menjadi origami atau dekorasi dinding kreatif.",
    "Jadikan bungkus kado atau pelapis buku yang personal.",
    "Buat kertas daur ulang manual di rumah—seru dicoba bersama anak.",
  ],
  kertas_kotor: [
    "Kertas kotor sulit dipakai ulang—alternatif terbaik adalah kompos jika tidak berminyak.",
  ],
  kaca_utuh: [
    "Botol kaca jadi vas bunga yang cantik dengan sedikit cat.",
    "Jadikan tempat lilin atau lampu hias yang hangat.",
    "Gunakan kembali sebagai wadah bumbu atau minuman.",
  ],
  kaca_pecah: [
    "Kaca pecah berbahaya—fokus pada penanganan aman, bukan reuse.",
    "Pecahan kaca halus bisa dijadikan bahan mosaik jika ditangani dengan benar.",
  ],
};

export const DEFAULT_TIPS = [
  "Pilah sampah berdasarkan jenisnya terlebih dahulu.",
  "Bersihkan sebelum diproses ulang.",
  "Cari inspirasi daur ulang kreatif di media sosial.",
];