import { useNavigate, useLocation } from "react-router-dom";
import {
  Recycle,
  Sparkles,
  MapPin,
  ChevronRight,
} from "lucide-react";

// ======================================================
// LABEL KATEGORI SAMPAH
// Mapping dari label ML ke nama yang ramah pengguna
// ======================================================

const CATEGORY_LABEL = {
  organik:          "Sampah Organik",
  plastik_pet:      "Plastik PET",
  plastik_hdpe:     "Plastik HDPE",
  plastik_campuran: "Plastik Campuran",
  kertas_bersih:    "Kertas Bersih",
  kertas_kotor:     "Kertas Kotor",
  kaca_utuh:        "Kaca Utuh",
  kaca_pecah:       "Kaca Pecah",
};

// ======================================================
// DAFTAR AKSI
// ======================================================

const ACTIONS = [
  {
    title: "Reuse / Kerajinan",
    desc: "Ubah sampah menjadi sesuatu yang bermanfaat dan bernilai.",
    icon: Sparkles,
    bg: "bg-amber-100",
    color: "text-amber-600",
    path: "/action/reuse",
  },
  {
    title: "Daur Ulang",
    desc: "Kirim ke fasilitas daur ulang agar dapat diproses kembali.",
    icon: Recycle,
    bg: "bg-emerald-100",
    color: "text-emerald-600",
    path: "/action/recycle",
  },
  {
    title: "Bank Sampah Mitra",
    desc: "Temukan lokasi bank sampah terdekat untuk setor sampah.",
    icon: MapPin,
    bg: "bg-blue-100",
    color: "text-blue-600",
    path: "/action/bank-sampah",
  },
];

// ======================================================
// ACTION PAGE
// ======================================================

const ActionPage = () => {
  const navigate  = useNavigate();
  const location  = useLocation();

  // Ambil hasil scan dari navigation state
  // Contoh cara navigate ke sini dari halaman scan:
  //   navigate("/action", { state: { result: "plastik_pet", prediction_id: 42 } })
  const result        = location.state?.result ?? null;
  const predictionId  = location.state?.prediction_id ?? null;

  // Tampilkan label yang ramah pengguna, fallback ke nama mentah atau teks generik
  const wasteLabel = result
    ? (CATEGORY_LABEL[result] ?? result)
    : "sampah ini";

  // ── Navigate ke halaman aksi, bawa state agar sub-halaman tahu konteksnya
  const handleNavigate = (path) => {
    navigate(path, {
      state: { result, prediction_id: predictionId },
    });
  };

  return (
    <section className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-5">
            <Recycle className="w-10 h-10 text-emerald-600" />
          </div>

          <h1 className="text-4xl font-bold text-slate-800">
            Pilih Aksi Selanjutnya
          </h1>

          <p className="text-slate-500 mt-3 text-lg">
            Bagaimana kamu ingin menangani{" "}
            <span className="font-semibold text-slate-700">
              {wasteLabel}
            </span>
            ?
          </p>
        </div>

        {/* CARDS */}
        <div className="grid md:grid-cols-3 gap-6">
          {ACTIONS.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className="bg-white border rounded-2xl p-6 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                <div
                  className={`w-14 h-14 rounded-xl ${item.bg} flex items-center justify-center mb-5`}
                >
                  <Icon className={`w-7 h-7 ${item.color}`} />
                </div>

                <h3 className="text-xl font-semibold text-slate-800">
                  {item.title}
                </h3>

                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  {item.desc}
                </p>

                <div className="mt-6 flex items-center text-emerald-600 font-medium">
                  Lihat Detail
                  <ChevronRight className="w-4 h-4 ml-1" />
                </div>
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