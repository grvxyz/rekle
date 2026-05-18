import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Sparkles, CheckCircle, ArrowLeft } from "lucide-react";
import api from "@/lib/axios";

// ======================================================
// DATA TIPS REUSE PER KATEGORI
// ======================================================

const REUSE_TIPS = {
  plastik_pet: [
    "Potong menjadi pot tanaman mini untuk balkon",
    "Jadikan tempat pensil atau alat tulis",
    "Lubangi bagian bawah, isi tanah, tanam benih microgreens",
  ],
  plastik_hdpe: [
    "Gunakan ulang sebagai wadah sabun refill",
    "Potong menjadi sekop mini untuk berkebun",
    "Jadikan ember kecil untuk menyimpan perkakas",
  ],
  plastik_campuran: [
    "Kumpulkan dan padatkan menjadi eco brick",
    "Jadikan bahan isian bantal dekorasi",
    "Gunakan sebagai material pengisi pot besar",
  ],
  kertas_bersih: [
    "Lipat menjadi origami atau hiasan dinding",
    "Gunakan sebagai pembungkus kado unik",
    "Buat sketchbook sederhana dari kertas bekas",
  ],
  kertas_kotor: [
    "Sobek kecil-kecil untuk bahan kompos",
    "Gunakan sebagai lapisan dasar pot tanaman",
    "Jadikan bahan papier-mâché untuk kerajinan anak",
  ],
  organik: [
    "Olah menjadi pupuk kompos rumahan",
    "Jadikan pakan ternak atau ikan",
    "Gunakan kulit buah sebagai pewangi alami",
  ],
  kaca_utuh: [
    "Jadikan vas bunga atau tempat lilin",
    "Gunakan sebagai wadah penyimpanan bumbu dapur",
    "Cat dan jadikan dekorasi rumah unik",
  ],
  kaca_pecah: [
    "Bungkus rapat dengan koran sebelum dibuang",
    "Pecahan halus bisa dijadikan mosaik dekorasi",
    "Serahkan ke pengepul kaca khusus",
  ],
};

const DEFAULT_TIPS = [
  "Periksa apakah barang masih bisa diperbaiki",
  "Cari inspirasi kerajinan di Pinterest atau YouTube",
  "Donasikan ke komunitas daur ulang kreatif",
];

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
// REUSE PAGE
// ======================================================

const ReusePage = () => {
  const navigate     = useNavigate();
  const location     = useLocation();

  const result        = location.state?.result ?? null;
  const predictionId  = location.state?.prediction_id ?? null;
  const wasteLabel    = result ? (CATEGORY_LABEL[result] ?? result) : "sampah";
  const tips          = result ? (REUSE_TIPS[result] ?? DEFAULT_TIPS) : DEFAULT_TIPS;

  const [notes, setNotes]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState("");

  // ── LOG AKSI ────────────────────────────────────────
  const handleLog = async () => {
    try {
      setLoading(true);
      setError("");

      await api.post("/actions/", {
        action_type:   "reuse",
        prediction_id: predictionId ?? undefined,
        notes:         notes.trim() || undefined,
      });

      setSuccess(true);
    } catch (err) {
      console.error("[ReusePage] Log action error:", err);
      setError(err.response?.data?.detail || "Gagal mencatat aksi");
    } finally {
      setLoading(false);
    }
  };

  // ── SUCCESS STATE ────────────────────────────────────
  if (success) {
    return (
      <SuccessBanner
        points={10}
        onHome={() => navigate("/dashboard")}
        onHistory={() => navigate("/history")}
      />
    );
  }

  return (
    <section className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* BACK */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft size={16} /> Kembali
        </button>

        {/* HEADER */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto bg-amber-100 rounded-full flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Reuse / Kerajinan</h1>
          <p className="text-slate-500">
            Ide kreatif untuk mengolah{" "}
            <span className="font-semibold text-slate-700">{wasteLabel}</span>
          </p>
        </div>

        {/* TIPS */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-3">
          <h2 className="font-semibold text-slate-700 mb-1">💡 Ide yang bisa kamu coba</h2>
          {tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-sm text-slate-600 leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>

        {/* LOG FORM */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
          <h2 className="font-semibold text-slate-700">Sudah melakukan reuse?</h2>
          <p className="text-sm text-slate-500">Catat aksimu dan dapatkan poin!</p>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ceritakan apa yang kamu buat... (opsional)"
            rows={3}
            maxLength={300}
            className="w-full border rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400"
          />

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <button
            onClick={handleLog}
            disabled={loading}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "✓ Catat Aksi (+10 poin)"}
          </button>
        </div>

      </div>
    </section>
  );
};

// ======================================================
// SUCCESS BANNER
// ======================================================

const SuccessBanner = ({ points, onHome, onHistory }) => (
  <section className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
    <div className="max-w-sm w-full bg-white rounded-2xl shadow-sm border p-8 text-center space-y-4">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
      <h2 className="text-2xl font-bold text-slate-800">Aksi Tercatat!</h2>
      <p className="text-slate-500 text-sm">
        Kamu mendapatkan{" "}
        <span className="font-bold text-green-600">+{points} poin</span>{" "}
        dari aksi reuse ini.
      </p>
      <div className="flex gap-3 pt-2">
        <button
          onClick={onHistory}
          className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Lihat Riwayat
        </button>
        <button
          onClick={onHome}
          className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors"
        >
          Ke Dashboard
        </button>
      </div>
    </div>
  </section>
);

export default ReusePage;