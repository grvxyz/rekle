/**
 * pages/action/ActionPage.jsx
 *
 * Hub pemilihan aksi setelah scan.
 * Menerima { result, prediction_id } via location.state dari ScanResult.
 * Semua route action sudah benar dan mengirimkan state ke masing-masing page.
 */

import { useNavigate, useLocation } from "react-router-dom";
import {
  Recycle,
  Sparkles,
  MapPin,
  ChevronRight,
  Leaf,
  Package,
  AlertTriangle,
  Ban,
  Layers,
} from "lucide-react";
import { CATEGORY_LABEL, RECOMMENDATION_MAP } from "@/constants/wasteConstants";

// ─── Config aksi — sinkron dengan backend action_type ──────
const ACTION_CONFIG = {
  kompos: {
    title: "Buat Kompos",
    desc:  "Ubah sisa makanan dan organik menjadi pupuk hidup untuk tanamanmu. Gratis, mudah, dan berdampak nyata.",
    icon:  Leaf,
    bg:    "bg-green-100",
    color: "text-green-600",
    path:  "/action/kompos",
  },
  daur_ulang: {
    title: "Daur Ulang",
    desc:  "Setor ke bank sampah atau fasilitas daur ulang—sampahmu bernilai dan langsung masuk rantai produksi ulang.",
    icon:  Recycle,
    bg:    "bg-emerald-100",
    color: "text-emerald-600",
    path:  "/action/recycle",
  },
  eco_brick: {
    title: "Eco Brick",
    desc:  "Padatkan plastik campur ke dalam botol jadi bata alternatif. Satu botol penuh = satu langkah nyata.",
    icon:  Package,
    bg:    "bg-orange-100",
    color: "text-orange-600",
    path:  "/action/eco-brick",
  },
  reuse: {
    title: "Reuse / Kerajinan",
    desc:  "Pakai lagi sebelum dibuang. Jadi pot, vas, organizer, atau karya seni—tanpa perlu beli bahan baru.",
    icon:  Sparkles,
    bg:    "bg-amber-100",
    color: "text-amber-600",
    path:  "/action/reuse",
  },
  khusus: {
    title: "Penanganan Khusus",
    desc:  "Sampah ini butuh perlakuan ekstra agar aman. Bungkus rapat, beri label, dan hubungi mitra khusus.",
    icon:  AlertTriangle,
    bg:    "bg-red-100",
    color: "text-red-500",
    path:  "/action/khusus",
  },
  tidak_layak: {
    title: "Tidak Layak Daur Ulang",
    desc:  "Sampah ini tidak bisa diproses ulang. Buang ke tempat sampah residu—jangan campur dengan yang bisa didaur ulang.",
    icon:  Ban,
    bg:    "bg-slate-100",
    color: "text-slate-500",
    path:  null,
  },
};

const BANK_SAMPAH_ACTION = {
  title: "Bank Sampah Mitra",
  desc:  "Setor langsung ke mitra terdekat dan tukar sampah jadi saldo atau poin. Cocok untuk semua jenis sampah pilah.",
  icon:  MapPin,
  bg:    "bg-blue-100",
  color: "text-blue-600",
  path:  "/action/bank-sampah",
};

// ─── Build action list ──────────────────────────────────────
function buildActions(recommendedKey) {
  const actions = [];
  const recommended = recommendedKey ? ACTION_CONFIG[recommendedKey] : null;

  // Rekomendasi utama (jika punya path / aksi nyata)
  if (recommended && recommended.path) {
    actions.push({ ...recommended, key: recommendedKey, isRecommended: true });
  }

  // Info-only (tidak_layak — tidak ada route, hanya tampilkan info)
  if (recommended && !recommended.path) {
    actions.unshift({ ...recommended, key: recommendedKey, isRecommended: true, infoOnly: true });
  }

  // Bank sampah — selalu ada kecuali sudah jadi rekomendasi
  if (recommendedKey !== "bank_sampah") {
    actions.push({ ...BANK_SAMPAH_ACTION, key: "bank_sampah", isRecommended: false });
  }

  // Alternatif berdasarkan konteks
  if (recommendedKey === "daur_ulang") {
    actions.push({ ...ACTION_CONFIG.reuse, key: "reuse", isRecommended: false });
  }
  if (["reuse", "kompos"].includes(recommendedKey)) {
    actions.push({ ...ACTION_CONFIG.daur_ulang, key: "daur_ulang", isRecommended: false });
  }
  if (recommendedKey === "eco_brick") {
    actions.push({ ...ACTION_CONFIG.daur_ulang, key: "daur_ulang", isRecommended: false });
    actions.push({ ...ACTION_CONFIG.reuse, key: "reuse", isRecommended: false });
  }
  if (recommendedKey === "khusus") {
    actions.push({ ...ACTION_CONFIG.daur_ulang, key: "daur_ulang", isRecommended: false });
  }

  // Jika tidak ada rekomendasi valid, tampilkan semua opsi utama
  if (!recommended) {
    actions.push(
      { ...ACTION_CONFIG.reuse, key: "reuse", isRecommended: false },
      { ...ACTION_CONFIG.daur_ulang, key: "daur_ulang", isRecommended: false },
      { ...ACTION_CONFIG.kompos, key: "kompos", isRecommended: false },
    );
  }

  return actions;
}

// ─── Component ──────────────────────────────────────────────
const ActionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const result        = location.state?.result ?? null;
  const predictionId  = location.state?.prediction_id ?? null;

  const wasteLabel     = result ? (CATEGORY_LABEL[result] ?? result) : "sampah ini";
  const recommendedKey = result ? (RECOMMENDATION_MAP[result] ?? null) : null;
  const recommended    = recommendedKey ? ACTION_CONFIG[recommendedKey] : null;
  const actions        = buildActions(recommendedKey);

  const handleNavigate = (path) => {
    if (!path) return;
    navigate(path, { state: { result, prediction_id: predictionId } });
  };

  return (
    <section className="min-h-screen bg-slate-50 px-6 py-16 mt-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-2xl mb-5">
            <Layers className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800">Pilih Aksi Selanjutnya</h1>
          <p className="text-slate-500 mt-3 text-lg">
            Bagaimana kamu mau tangani{" "}
            <span className="font-semibold text-slate-700">{wasteLabel}</span>?
          </p>
          {recommended && recommended.path && (
            <span className="inline-block mt-3 text-sm bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full font-medium">
              ✦ Rekomendasi AI: {recommended.title}
            </span>
          )}
          {!predictionId && (
            <p className="mt-3 text-xs text-amber-600 bg-amber-50 border border-amber-200 inline-block px-3 py-1 rounded-full">
              ⚠️ Kamu membuka halaman ini tanpa hasil scan — poin tidak bisa diklaim.
            </p>
          )}
        </div>

        {/* Action cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {actions.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.key}
                onClick={() => !item.infoOnly && handleNavigate(item.path)}
                className={`bg-white border rounded-2xl p-6 transition-all relative ${
                  item.infoOnly
                    ? "opacity-75 cursor-default"
                    : "cursor-pointer hover:shadow-lg hover:-translate-y-1"
                } ${
                  item.isRecommended
                    ? "border-emerald-300 ring-2 ring-emerald-100 shadow-sm"
                    : "border-slate-200"
                }`}
              >
                {item.isRecommended && !item.infoOnly && (
                  <span className="absolute top-4 right-4 text-xs bg-emerald-600 text-white font-semibold px-2 py-0.5 rounded-full">
                    Disarankan
                  </span>
                )}
                {item.infoOnly && (
                  <span className="absolute top-4 right-4 text-xs bg-slate-200 text-slate-500 font-semibold px-2 py-0.5 rounded-full">
                    Info Saja
                  </span>
                )}

                <div className={`w-14 h-14 rounded-xl ${item.bg} flex items-center justify-center mb-5`}>
                  <Icon className={`w-7 h-7 ${item.color}`} />
                </div>

                <h3 className="text-xl font-semibold text-slate-800">{item.title}</h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">{item.desc}</p>

                {!item.infoOnly && (
                  <div className={`mt-6 flex items-center font-medium ${
                    item.isRecommended ? "text-emerald-600" : "text-slate-500"
                  }`}>
                    Lihat Detail
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-center text-sm text-slate-400 mt-10">
          Semua aksi butuh foto bukti dan akan diverifikasi admin sebelum poin diberikan.
        </p>
      </div>
    </section>
  );
};

export default ActionPage;