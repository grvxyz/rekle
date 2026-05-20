import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Recycle, Clock, ArrowLeft, Camera } from "lucide-react";
import api from "@/lib/axios";
import {
  CATEGORY_LABEL,
  RECYCLE_INFO,
  DEFAULT_INFO,
} from "@/constants/wasteConstants";

// ======================================================
// RECYCLE PAGE
// ======================================================

const RecyclePage = () => {
  const navigate     = useNavigate();
  const location     = useLocation();
  const result       = location.state?.result ?? null;
  const predictionId = location.state?.prediction_id ?? null;
  const wasteLabel   = result ? (CATEGORY_LABEL[result] ?? result) : "sampah";
  const info         = (result && RECYCLE_INFO[result]) ? RECYCLE_INFO[result] : DEFAULT_INFO;

  const [step, setStep]         = useState("form");
  const [actionId, setActionId] = useState(null);

  const [partnerName, setPartnerName] = useState("");
  const [notes, setNotes]             = useState("");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");

  const [proofFile, setProofFile]       = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [proofLoading, setProofLoading] = useState(false);
  const [proofError, setProofError]     = useState("");

  const handleLog = async () => {
    if (!predictionId) {
      setError("Aksi hanya bisa dicatat setelah melakukan scan sampah.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const { data } = await api.post("/actions/", {
        action_type:   "daur_ulang",  // sinkron dengan backend
        route:         "mandiri",
        prediction_id: predictionId,
        partner_name:  partnerName.trim() || undefined,
        notes:         notes.trim() || undefined,
      });
      setActionId(data.id);
      setStep("proof");
    } catch (err) {
      console.error("[RecyclePage] create action error:", err);
      const detail = err.response?.data?.detail;
      setError(
        Array.isArray(detail)
          ? detail.map((d) => d.msg).join(", ")
          : detail || "Gagal mencatat aksi"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleProofFile = (file) => {
    if (!file) return;
    setProofFile(file);
    setProofPreview(URL.createObjectURL(file));
    setProofError("");
  };

  const handleUploadProof = async () => {
    if (!proofFile) {
      setProofError("Pilih foto bukti terlebih dahulu.");
      return;
    }
    try {
      setProofLoading(true);
      setProofError("");
      const formData = new FormData();
      formData.append("file", proofFile);
      await api.post(`/actions/${actionId}/proof`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setStep("done");
    } catch (err) {
      console.error("[RecyclePage] upload proof error:", err);
      const detail = err.response?.data?.detail;
      setProofError(
        Array.isArray(detail)
          ? detail.map((d) => d.msg).join(", ")
          : detail || "Gagal upload foto bukti"
      );
    } finally {
      setProofLoading(false);
    }
  };

  if (step === "done") return (
    <PendingBanner
      onHome={() => navigate("/dashboard")}
      onHistory={() => navigate("/history")}
    />
  );

  return (
    <section className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-2xl mx-auto space-y-6">

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft size={16} /> Kembali
        </button>

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

        <StepIndicator step={step} />

        {step === "form" && (
          <>
            <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed">{info.desc}</p>
              <h3 className="font-semibold text-slate-700">Langkah-langkah:</h3>
              <ol className="space-y-3">
                {info.steps.map((s, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-slate-600 leading-relaxed">{s}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
              <h2 className="font-semibold text-slate-700">Sudah mendaur ulang?</h2>
              <p className="text-sm text-slate-500">
                Isi keterangan — foto bukti diminta di langkah berikutnya.
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
                <label className="text-xs font-medium text-slate-600">Catatan (opsional)</label>
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
                {loading ? "Menyimpan..." : "Lanjut → Upload Bukti"}
              </button>
            </div>
          </>
        )}

        {step === "proof" && (
          <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
            <h2 className="font-semibold text-slate-700">Upload Foto Bukti</h2>
            <p className="text-sm text-slate-500">
              Foto saat menyerahkan sampah ke fasilitas daur ulang.
            </p>

            {proofPreview ? (
              <div className="relative">
                <img
                  src={proofPreview}
                  alt="Preview bukti"
                  className="w-full h-56 object-cover rounded-xl border"
                />
                <button
                  onClick={() => { setProofFile(null); setProofPreview(null); }}
                  className="absolute top-2 right-2 bg-white border rounded-full px-2 py-1 text-xs text-slate-600 hover:bg-red-50 hover:text-red-500"
                >
                  Ganti
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-emerald-300 rounded-xl cursor-pointer hover:bg-emerald-50 transition-colors">
                <Camera className="w-8 h-8 text-emerald-400 mb-2" />
                <span className="text-sm text-slate-500">Klik untuk pilih foto</span>
                <span className="text-xs text-slate-400 mt-1">JPG, PNG, WEBP</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => handleProofFile(e.target.files[0])}
                />
              </label>
            )}

            {proofError && <p className="text-sm text-red-500">{proofError}</p>}
            <button
              onClick={handleUploadProof}
              disabled={proofLoading || !proofFile}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              {proofLoading ? "Mengupload..." : "✓ Kirim Bukti"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

// ── Step Indicator ─────────────────────────────────────────
const StepIndicator = ({ step }) => {
  const steps  = ["form", "proof", "done"];
  const labels = ["Keterangan", "Foto Bukti", "Selesai"];
  const current = steps.indexOf(step);
  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
            i <= current ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-400"
          }`}>
            {i + 1}
          </div>
          <span className={`text-xs ${i <= current ? "text-emerald-600 font-medium" : "text-slate-400"}`}>
            {labels[i]}
          </span>
          {i < steps.length - 1 && (
            <div className={`w-8 h-0.5 ${i < current ? "bg-emerald-400" : "bg-slate-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
};

// ── Pending Banner ─────────────────────────────────────────
const PendingBanner = ({ onHome, onHistory }) => (
  <section className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
    <div className="max-w-sm w-full bg-white rounded-2xl shadow-sm border p-8 text-center space-y-4">
      <Clock className="w-16 h-16 text-amber-400 mx-auto" />
      <h2 className="text-2xl font-bold text-slate-800">Aksi Tercatat!</h2>
      <p className="text-slate-500 text-sm leading-relaxed">
        Aksimu sedang menunggu verifikasi admin. Poin akan otomatis ditambahkan setelah disetujui.
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