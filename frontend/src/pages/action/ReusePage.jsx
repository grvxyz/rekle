import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Sparkles, Clock, ArrowLeft, Camera } from "lucide-react";
import api from "@/lib/axios";
import {
  CATEGORY_LABEL,
  REUSE_TIPS,
  DEFAULT_TIPS,
  RECOMMENDATION_MAP,
} from "@/constants/wasteConstants";

// ─── Petakan kategori sampah ke action_type backend ────────
// Sinkron dengan app/ml/recommendation.py _RECOMMENDATION_MAP
// action_type yang diterima: kompos | daur_ulang | eco_brick | reuse | khusus
const getActionType = (result) => {
  const rec = RECOMMENDATION_MAP[result];
  // ReusePage menangani: reuse, kompos, eco_brick
  if (["reuse", "kompos", "eco_brick"].includes(rec)) return rec;
  return "reuse"; // fallback
};

// ======================================================
// REUSE PAGE
// ======================================================

const ReusePage = () => {
  const navigate     = useNavigate();
  const location     = useLocation();
  const result       = location.state?.result ?? null;
  const predictionId = location.state?.prediction_id ?? null;
  const wasteLabel   = result ? (CATEGORY_LABEL[result] ?? result) : "sampah";
  const tips         = result ? (REUSE_TIPS[result] ?? DEFAULT_TIPS) : DEFAULT_TIPS;
  const actionType   = getActionType(result);

  // step: "form" | "proof" | "done"
  const [step, setStep]         = useState("form");
  const [actionId, setActionId] = useState(null);

  // step form
  const [notes, setNotes]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  // step proof
  const [proofFile, setProofFile]       = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [proofLoading, setProofLoading] = useState(false);
  const [proofError, setProofError]     = useState("");

  // ── Step 1: buat aksi ──────────────────────────────────
  const handleLog = async () => {
    if (!predictionId) {
      setError("Aksi hanya bisa dicatat setelah melakukan scan sampah.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const { data } = await api.post("/actions/", {
        action_type:   actionType,   // kompos | reuse | eco_brick
        route:         "mandiri",
        prediction_id: predictionId,
        notes:         notes.trim() || undefined,
      });
      setActionId(data.id);
      setStep("proof");
    } catch (err) {
      console.error("[ReusePage] create action error:", err);
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

  // ── Step 2: upload bukti foto ──────────────────────────
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
      console.error("[ReusePage] upload proof error:", err);
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

  // ── Render: done ───────────────────────────────────────
  if (step === "done") return (
    <PendingBanner
      onHome={() => navigate("/dashboard")}
      onHistory={() => navigate("/history")}
    />
  );

  const pageTitle =
    actionType === "kompos"    ? "Buat Kompos" :
    actionType === "eco_brick" ? "Eco Brick" :
    "Reuse / Kerajinan";

  const pageSubtitle =
    actionType === "kompos"    ? "Cara mengolah" :
    actionType === "eco_brick" ? "Cara membuat eco brick dari" :
    "Ide kreatif untuk mengolah";

  // ── Render: utama ──────────────────────────────────────
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
          <div className="w-16 h-16 mx-auto bg-amber-100 rounded-full flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">{pageTitle}</h1>
          <p className="text-slate-500">
            {pageSubtitle}{" "}
            <span className="font-semibold text-slate-700">{wasteLabel}</span>
          </p>
        </div>

        <StepIndicator step={step} />

        {/* ── STEP 1: FORM ── */}
        {step === "form" && (
          <>
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

            <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
              <h2 className="font-semibold text-slate-700">Sudah dilakukan?</h2>
              <p className="text-sm text-slate-500">
                Tulis keterangan singkat — kamu akan diminta upload foto bukti di langkah berikutnya.
              </p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ceritakan apa yang kamu buat... (opsional)"
                rows={3}
                maxLength={300}
                className="w-full border rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button
                onClick={handleLog}
                disabled={loading}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                {loading ? "Menyimpan..." : "Lanjut → Upload Bukti"}
              </button>
            </div>
          </>
        )}

        {/* ── STEP 2: UPLOAD BUKTI ── */}
        {step === "proof" && (
          <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
            <h2 className="font-semibold text-slate-700">Upload Foto Bukti</h2>
            <p className="text-sm text-slate-500">
              Foto hasil kerajinan atau proses {pageTitle.toLowerCase()} kamu. Diperlukan untuk verifikasi admin.
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
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-amber-300 rounded-xl cursor-pointer hover:bg-amber-50 transition-colors">
                <Camera className="w-8 h-8 text-amber-400 mb-2" />
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
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
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
            i <= current ? "bg-amber-500 text-white" : "bg-slate-200 text-slate-400"
          }`}>
            {i + 1}
          </div>
          <span className={`text-xs ${i <= current ? "text-amber-600 font-medium" : "text-slate-400"}`}>
            {labels[i]}
          </span>
          {i < steps.length - 1 && (
            <div className={`w-8 h-0.5 ${i < current ? "bg-amber-400" : "bg-slate-200"}`} />
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

export default ReusePage;