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
} from "lucide-react";
import { CATEGORY_LABEL, RECOMMENDATION_MAP } from "@/constants/wasteConstants";

// ─── Konfigurasi aksi berdasarkan action_type backend ──────
// Sinkron dengan app/ml/recommendation.py _RECOMMENDATION_MAP
const ACTION_CONFIG = {
  kompos: {
    title: "Buat Kompos",
    desc: "Olah sampah organik menjadi pupuk kompos untuk tanaman.",
    icon: Leaf,
    bg: "bg-green-100",
    color: "text-green-600",
    path: "/action/reuse", // reuse page juga menampilkan tips kompos
  },
  daur_ulang: {
    title: "Daur Ulang",
    desc: "Kirim ke fasilitas daur ulang agar dapat diproses kembali.",
    icon: Recycle,
    bg: "bg-emerald-100",
    color: "text-emerald-600",
    path: "/action/recycle",
  },
  eco_brick: {
    title: "Eco Brick",
    desc: "Padatkan plastik campuran ke dalam botol sebagai material bangunan.",
    icon: Package,
    bg: "bg-orange-100",
    color: "text-orange-600",
    path: "/action/reuse",
  },
  reuse: {
    title: "Reuse / Kerajinan",
    desc: "Ubah sampah menjadi sesuatu yang bermanfaat dan bernilai.",
    icon: Sparkles,
    bg: "bg-amber-100",
    color: "text-amber-600",
    path: "/action/reuse",
  },
  tidak_layak: {
    title: "Tidak Layak Daur Ulang",
    desc: "Buang ke tempat sampah residu. Kertas kotor/basah tidak bisa diproses.",
    icon: Ban,
    bg: "bg-slate-100",
    color: "text-slate-500",
    path: null, // tidak ada aksi lanjutan
  },
  khusus: {
    title: "Penanganan Khusus",
    desc: "Bungkus rapat dan beri label sebelum dibuang atau hubungi mitra khusus.",
    icon: AlertTriangle,
    bg: "bg-red-100",
    color: "text-red-500",
    path: "/action/bank-sampah",
  },
};

// Aksi bank sampah selalu tersedia sebagai pilihan tambahan
const BANK_SAMPAH_ACTION = {
  title: "Bank Sampah Mitra",
  desc: "Temukan lokasi bank sampah terdekat untuk setor sampah.",
  icon: MapPin,
  bg: "bg-blue-100",
  color: "text-blue-600",
  path: "/action/bank-sampah",
};

const ActionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const result       = location.state?.result ?? null;
  const predictionId = location.state?.prediction_id ?? null;

  const wasteLabel    = result ? (CATEGORY_LABEL[result] ?? result) : "sampah ini";
  const recommendedKey = result ? (RECOMMENDATION_MAP[result] ?? null) : null;
  const recommended   = recommendedKey ? ACTION_CONFIG[recommendedKey] : null;

  // Susun daftar aksi: rekomendasi utama di atas, lalu bank sampah,
  // lalu sisa aksi yang relevan (kecuali tidak_layak dan khusus yang tidak punya path)
  const buildActions = () => {
    const actions = [];

    if (recommended && recommended.path) {
      actions.push({ ...recommended, key: recommendedKey, isRecommended: true });
    }

    // Bank sampah selalu muncul kecuali rekomendasi sudah bank sampah
    if (recommendedKey !== "bank_sampah") {
      actions.push({ ...BANK_SAMPAH_ACTION, key: "bank_sampah", isRecommended: false });
    }

    // Jika rekomendasi adalah daur_ulang, tambahkan reuse sebagai alternatif
    if (recommendedKey === "daur_ulang") {
      actions.push({ ...ACTION_CONFIG.reuse, key: "reuse", isRecommended: false });
    }

    // Jika rekomendasi adalah reuse/kompos/eco_brick, tambahkan daur_ulang sebagai alternatif
    if (["reuse", "kompos", "eco_brick"].includes(recommendedKey)) {
      actions.push({ ...ACTION_CONFIG.daur_ulang, key: "daur_ulang", isRecommended: false });
    }

    // Jika tidak ada rekomendasi (tidak_layak/khusus), tampilkan semua opsi yang punya path
    if (!recommended || !recommended.path) {
      if (recommended && !recommended.path) {
        // Tetap tampilkan info aksi meski tidak ada path
        actions.unshift({ ...recommended, key: recommendedKey, isRecommended: true, infoOnly: true });
      }
      if (!actions.find((a) => a.key === "reuse")) {
        actions.push({ ...ACTION_CONFIG.reuse, key: "reuse", isRecommended: false });
      }
      if (!actions.find((a) => a.key === "daur_ulang")) {
        actions.push({ ...ACTION_CONFIG.daur_ulang, key: "daur_ulang", isRecommended: false });
      }
    }

    return actions;
  };

  const actions = buildActions();

  const handleNavigate = (path) => {
    if (!path) return;
    navigate(path, {
      state: { result, prediction_id: predictionId },
    });
  };

  return (
    <section className="min-h-screen bg-slate-50 px-6 py-16 mt-4">
      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800">
            Pilih Aksi Selanjutnya
          </h1>
          <p className="text-slate-500 mt-3 text-lg">
            Bagaimana kamu ingin menangani{" "}
            <span className="font-semibold text-slate-700">{wasteLabel}</span>?
          </p>
          {recommended && (
            <p className="mt-2 text-sm text-emerald-600 font-medium">
              ✦ Rekomendasi: {recommended.title}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {actions.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.key}
                onClick={() => !item.infoOnly && handleNavigate(item.path)}
                className={`bg-white border rounded-2xl p-6 transition-all relative ${
                  item.infoOnly
                    ? "opacity-80 cursor-default"
                    : "cursor-pointer hover:shadow-lg hover:-translate-y-1"
                } ${item.isRecommended ? "border-emerald-300 ring-1 ring-emerald-200" : ""}`}
              >
                {item.isRecommended && (
                  <span className="absolute top-4 right-4 text-xs bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">
                    Disarankan
                  </span>
                )}
                <div className={`w-14 h-14 rounded-xl ${item.bg} flex items-center justify-center mb-5`}>
                  <Icon className={`w-7 h-7 ${item.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-slate-800">{item.title}</h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">{item.desc}</p>
                {!item.infoOnly && (
                  <div className="mt-6 flex items-center text-emerald-600 font-medium">
                    Lihat Detail
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-center text-sm text-slate-400 mt-10">
          Pilih salah satu aksi untuk melanjutkan
        </p>
      </div>
    </section>
  );
};

export default ActionPage;