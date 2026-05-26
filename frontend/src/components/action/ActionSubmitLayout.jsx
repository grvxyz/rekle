/**
 * components/action/ActionSubmitLayout.jsx
 *
 * Layout reusable untuk semua halaman action submission.
 * Mengelola state wizard: form → proof → done
 *
 * Props:
 *  - icon: Lucide icon component
 *  - iconBg: tailwind class e.g. "bg-emerald-100"
 *  - iconColor: tailwind class e.g. "text-emerald-600"
 *  - accentColor: tailwind color prefix e.g. "emerald" → tombol bg-emerald-600
 *  - title: judul halaman
 *  - subtitle: keterangan sampah
 *  - guideTitle: judul panduan
 *  - guideDesc: deskripsi panduan
 *  - guideSteps: array string langkah-langkah
 *  - formContent: JSX form tambahan (name, notes, dll)
 *  - formCTA: teks tombol submit form
 *  - onSubmitAction: async fn → returns { id } action yang dibuat
 *  - onSubmitProof: async fn(actionId, file) → void
 *  - pendingTitle: judul banner pending
 *  - pendingDesc: deskripsi banner pending
 *  - proofLabel: label upload foto (e.g. "Foto saat menyerahkan ke mitra")
 *  - extraProofContent: JSX extra info di step proof
 *  - isLoggedIn: boolean
 *  - predictionId: number|null
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Clock, CheckCircle } from "lucide-react";
import GuestClaimBlock from "@/components/scan/GuestClaimBlock";
import api from "@/lib/axios";

// ── Step indicator ──────────────────────────────────────────
const STEP_LIST = ["form", "proof", "done"];
const STEP_LABELS = ["Detail", "Foto Bukti", "Selesai"];

const StepIndicator = ({ step, accentColor }) => {
  const current = STEP_LIST.indexOf(step);
  return (
    <div className="flex items-center justify-center gap-1">
      {STEP_LIST.map((s, i) => (
        <div key={s} className="flex items-center gap-1">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              i < current
                ? `bg-${accentColor}-600 text-white`
                : i === current
                ? `bg-${accentColor}-600 text-white ring-4 ring-${accentColor}-100`
                : "bg-slate-200 text-slate-400"
            }`}
          >
            {i < current ? <CheckCircle size={14} /> : i + 1}
          </div>
          <span
            className={`text-xs hidden sm:block ${
              i <= current
                ? `text-${accentColor}-600 font-medium`
                : "text-slate-400"
            }`}
          >
            {STEP_LABELS[i]}
          </span>
          {i < STEP_LIST.length - 1 && (
            <div
              className={`w-8 h-0.5 mx-1 ${
                i < current ? `bg-${accentColor}-400` : "bg-slate-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

// ── Proof uploader ──────────────────────────────────────────
const ProofUploader = ({
  accentColor,
  proofLabel,
  extraProofContent,
  actionId,
  onDone,
}) => {
  const [file, setFile]         = useState(null);
  const [preview, setPreview]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError("");
  };

  const handleUpload = async () => {
    if (!file) { setError("Pilih foto bukti terlebih dahulu."); return; }
    try {
      setLoading(true);
      setError("");
      const formData = new FormData();
      formData.append("file", file);
      await api.post(`/actions/${actionId}/proof`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onDone();
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(
        Array.isArray(detail)
          ? detail.map((d) => d.msg).join(", ")
          : detail || "Gagal mengupload foto bukti."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
      <div>
        <h2 className="font-semibold text-slate-700 text-lg">Upload Foto Bukti</h2>
        <p className="text-sm text-slate-500 mt-1">
          {proofLabel || "Foto sebagai bukti bahwa aksimu benar-benar dilakukan."}
        </p>
      </div>

      {extraProofContent}

      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview bukti"
            className="w-full h-56 object-cover rounded-xl border"
          />
          <button
            onClick={() => { setFile(null); setPreview(null); }}
            className="absolute top-2 right-2 bg-white border rounded-full px-2 py-1 text-xs text-slate-600 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            Ganti Foto
          </button>
        </div>
      ) : (
        <label
          className={`flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-${accentColor}-300 rounded-xl cursor-pointer hover:bg-${accentColor}-50 transition-colors`}
        >
          <Camera className={`w-9 h-9 text-${accentColor}-400 mb-2`} />
          <span className="text-sm text-slate-500 font-medium">Klik untuk pilih foto</span>
          <span className="text-xs text-slate-400 mt-1">JPG · PNG · WEBP · maks. 10 MB</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </label>
      )}

      {error && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
          {error}
        </p>
      )}

      <button
        onClick={handleUpload}
        disabled={loading || !file}
        className={`w-full py-3 bg-${accentColor}-600 hover:bg-${accentColor}-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Mengupload...
          </span>
        ) : (
          "✓ Kirim Foto Bukti"
        )}
      </button>
    </div>
  );
};

// ── Pending banner ──────────────────────────────────────────
const PendingBanner = ({ pendingTitle, pendingDesc, onHome, onHistory }) => (
  <section className="min-h-[70vh] flex items-center justify-center px-6">
    <div className="max-w-sm w-full bg-white rounded-2xl shadow-md border p-8 text-center space-y-5">
      <div className="w-20 h-20 mx-auto bg-amber-50 rounded-full flex items-center justify-center">
        <Clock className="w-10 h-10 text-amber-400" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-slate-800">
          {pendingTitle || "Aksi Tercatat!"}
        </h2>
        <p className="text-slate-500 text-sm leading-relaxed mt-2">
          {pendingDesc ||
            "Aksimu sedang menunggu verifikasi admin. Poin akan ditambahkan otomatis setelah disetujui."}
        </p>
      </div>
      <div className="flex gap-3 pt-1">
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

// ── Main layout ─────────────────────────────────────────────
const ActionSubmitLayout = ({
  icon: Icon,
  iconBg = "bg-emerald-100",
  iconColor = "text-emerald-600",
  accentColor = "emerald",
  title,
  subtitle,
  guideTitle = "Panduan",
  guideDesc,
  guideSteps = [],
  formContent,
  formCTA = "Lanjut → Upload Bukti",
  onSubmitAction,
  pendingTitle,
  pendingDesc,
  proofLabel,
  extraProofContent,
  isLoggedIn,
  predictionId,
}) => {
  const navigate = useNavigate();
  const [step,     setStep]     = useState("form");
  const [actionId, setActionId] = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleSubmitForm = async () => {
    if (!predictionId) {
      setError("Aksi hanya bisa dicatat setelah melakukan scan sampah. Silakan scan dulu.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const data = await onSubmitAction();
      setActionId(data.id);
      setStep("proof");
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(
        Array.isArray(detail)
          ? detail.map((d) => d.msg).join(", ")
          : detail || "Gagal mencatat aksi. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  };

  if (step === "done") {
    return (
      <PendingBanner
        pendingTitle={pendingTitle}
        pendingDesc={pendingDesc}
        onHome={() => navigate("/dashboard")}
        onHistory={() => navigate("/history")}
      />
    );
  }

  return (
    <section className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Kembali
        </button>

        {/* Header */}
        <div className="text-center space-y-3">
          <div className={`w-16 h-16 mx-auto ${iconBg} rounded-full flex items-center justify-center`}>
            <Icon className={`w-8 h-8 ${iconColor}`} />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">{title}</h1>
          {subtitle && <p className="text-slate-500 text-sm">{subtitle}</p>}
        </div>

        {/* Step indicator — hanya untuk user login */}
        {isLoggedIn && <StepIndicator step={step} accentColor={accentColor} />}

        {/* Guide card */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
          <div>
            <h3 className="font-semibold text-slate-700 text-base">{guideTitle}</h3>
            {guideDesc && (
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">{guideDesc}</p>
            )}
          </div>
          {guideSteps.length > 0 && (
            <ol className="space-y-3">
              {guideSteps.map((s, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className={`w-6 h-6 rounded-full bg-${accentColor}-100 text-${accentColor}-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5`}
                  >
                    {i + 1}
                  </span>
                  <p className="text-sm text-slate-600 leading-relaxed">{s}</p>
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* Form step */}
        {step === "form" && (
          isLoggedIn ? (
            <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
              <div>
                <h2 className="font-semibold text-slate-700 text-lg">Sudah dilakukan?</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Isi keterangan dan upload foto bukti di langkah berikutnya.
                </p>
              </div>

              {formContent}

              {!predictionId && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
                  ⚠️ Aksi ini perlu dikaitkan dengan hasil scan sampah. Pastikan kamu sudah
                  melakukan scan terlebih dahulu.
                </div>
              )}

              {error && (
                <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
                  {error}
                </p>
              )}

              <button
                onClick={handleSubmitForm}
                disabled={loading || !predictionId}
                className={`w-full py-3 bg-${accentColor}-600 hover:bg-${accentColor}-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Menyimpan...
                  </span>
                ) : (
                  formCTA
                )}
              </button>
            </div>
          ) : (
            <GuestClaimBlock />
          )
        )}

        {/* Proof step */}
        {step === "proof" && isLoggedIn && (
          <ProofUploader
            accentColor={accentColor}
            proofLabel={proofLabel}
            extraProofContent={extraProofContent}
            actionId={actionId}
            onDone={() => setStep("done")}
          />
        )}

      </div>
    </section>
  );
};

export default ActionSubmitLayout;