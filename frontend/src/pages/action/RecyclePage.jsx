import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Recycle, CheckCircle, ArrowLeft } from "lucide-react";
import api from "@/lib/axios";

// ======================================================
// INFO DAUR ULANG PER KATEGORI
// ======================================================

const RECYCLE_INFO = {
  plastik_pet: {
    desc: "Plastik PET (kode #1) adalah salah satu plastik paling mudah didaur ulang. Biasanya berwarna bening atau biru muda.",
    steps: [
      "Bersihkan dari sisa makanan atau minuman",
      "Lepas tutup botol (beda jenis plastik)",
      "Gepengkan untuk menghemat tempat",
      "Kumpulkan lalu serahkan ke bank sampah atau pengepul",
    ],
    points: 15,
  },
  plastik_hdpe: {
    desc: "Plastik HDPE (kode #2) biasa ditemukan pada botol sabun, sampo, dan jerigen. Mudah didaur ulang dan bernilai jual.",
    steps: [
      "Bilas hingga bersih dari sisa produk",
      "Biarkan kering sebelum dikumpulkan",
      "Serahkan ke bank sampah atau pengepul plastik",
    ],
    points: 15,
  },
  plastik_campuran: [
    "Pisahkan berdasarkan kode plastik (lihat bagian bawah produk)",
    "Serahkan ke fasilitas daur ulang yang menerima campuran",
  ],
  kertas_bersih: {
    desc: "Kertas bersih dan kering bisa didaur ulang menjadi produk kertas baru. Pastikan tidak terkontaminasi minyak atau basah.",
    steps: [
      "Pastikan kertas kering dan bersih",
      "Pisahkan dari plastik atau staples",
      "Bundel atau masukkan ke dalam kardus",
      "Serahkan ke bank sampah atau pengepul kertas",
    ],
    points: 15,
  },
  kaca_utuh: {
    desc: "Kaca dapat didaur ulang berkali-kali tanpa kehilangan kualitas. Pastikan diserahkan ke fasilitas yang memiliki peleburan kaca.",
    steps: [
      "Bersihkan dari sisa makanan atau minuman",
      "Jangan campur dengan kaca pecah",
      "Serahkan ke pengepul kaca atau bank sampah",
    ],
    points: 15,
  },
};

const DEFAULT_INFO = {
  desc: "Material ini bisa didaur ulang jika diserahkan ke fasilitas yang tepat. Hubungi bank sampah terdekat untuk informasi lebih lanjut.",
  steps: [
    "Bersihkan dari kontaminan",
    "Kumpulkan dalam jumlah yang cukup",
    "Serahkan ke bank sampah atau mitra daur ulang",
  ],
  points: 15,
};

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
// RECYCLE PAGE
// ======================================================

const RecyclePage = () => {
  const navigate    = useNavigate();
  const location    = useLocation();

  const result       = location.state?.result ?? null;
  const predictionId = location.state?.prediction_id ?? null;
  const wasteLabel   = result ? (CATEGORY_LABEL[result] ?? result) : "sampah";

  const info = (result && RECYCLE_INFO[result] && !Array.isArray(RECYCLE_INFO[result]))
    ? RECYCLE_INFO[result]
    : DEFAULT_INFO;

  const [partnerName, setPartnerName] = useState("");
  const [notes, setNotes]             = useState("");
  const [loading, setLoading]         = useState(false);
  const [success, setSuccess]         = useState(false);
  const [error, setError]             = useState("");

  // ── LOG AKSI ────────────────────────────────────────
  const handleLog = async () => {
    try {
      setLoading(true);
      setError("");

      await api.post("/actions/", {
        action_type:   "daur_ulang",
        prediction_id: predictionId ?? undefined,
        partner_name:  partnerName.trim() || undefined,
        notes:         notes.trim() || undefined,
      });

      setSuccess(true);
    } catch (err) {
      console.error("[RecyclePage] Log action error:", err);
      setError(err.response?.data?.detail || "Gagal mencatat aksi");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <SuccessBanner
        points={info.points}
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
          <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center">
            <Recycle className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Daur Ulang</h1>
          <p className="text-slate-500">
            Panduan mendaur ulang{" "}
            <span className="font-semibold text-slate-700">{wasteLabel}</span>
          </p>
        </div>

        {/* INFO */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">{info.desc}</p>

          <h3 className="font-semibold text-slate-700">Langkah-langkah:</h3>
          <ol className="space-y-3">
            {info.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-slate-600 leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* LOG FORM */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
          <h2 className="font-semibold text-slate-700">Sudah mendaur ulang?</h2>
          <p className="text-sm text-slate-500">
            Catat ke mana kamu menyerahkan sampah dan dapatkan poin!
          </p>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">
              Nama bank sampah / fasilitas (opsional)
            </label>
            <input
              type="text"
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
              placeholder="cth: Bank Sampah Induk Yogyakarta"
              className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">
              Catatan (opsional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tambahkan catatan..."
              rows={2}
              maxLength={300}
              className="w-full border rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            onClick={handleLog}
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : `✓ Catat Aksi (+${info.points} poin)`}
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
        dari aksi daur ulang ini.
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

export default RecyclePage;