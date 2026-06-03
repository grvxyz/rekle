import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  Clock,
  CheckCircle,
} from "lucide-react";

import GuestClaimBlock from "@/components/scan/GuestClaimBlock";
import api from "@/lib/axios";

// ── Accent styles ──────────────────────────────────────────
const ACCENT_STYLES = {
  emerald: {
    button: "bg-emerald-600 hover:bg-emerald-700",
    soft: "bg-emerald-50",
    border: "border-emerald-300",
    text: "text-emerald-500",
    textDark: "text-emerald-700",
    ring: "ring-emerald-100",
    step: "bg-emerald-600",
    line: "bg-emerald-400",
  },

  amber: {
    button: "bg-amber-600 hover:bg-amber-700",
    soft: "bg-amber-50",
    border: "border-amber-300",
    text: "text-amber-500",
    textDark: "text-amber-700",
    ring: "ring-amber-100",
    step: "bg-amber-600",
    line: "bg-amber-400",
  },

  violet: {
    button: "bg-violet-600 hover:bg-violet-700",
    soft: "bg-violet-50",
    border: "border-violet-300",
    text: "text-violet-500",
    textDark: "text-violet-700",
    ring: "ring-violet-100",
    step: "bg-violet-600",
    line: "bg-violet-400",
  },
};

// ── Step indicator ─────────────────────────────────────────
const STEP_LIST = ["form", "proof", "done"];
const STEP_LABELS = ["Detail", "Foto Bukti", "Selesai"];

const StepIndicator = ({ step, accentColor }) => {
  const current = STEP_LIST.indexOf(step);

  const styles =
    ACCENT_STYLES[accentColor] || ACCENT_STYLES.emerald;

  return (
    <div className="flex items-center justify-center gap-1">
      {STEP_LIST.map((s, i) => (
        <div key={s} className="flex items-center gap-1">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              i <= current
                ? `${styles.step} text-white ${
                    i === current ? `ring-4 ${styles.ring}` : ""
                  }`
                : "bg-slate-200 text-slate-400"
            }`}
          >
            {i < current ? <CheckCircle size={14} /> : i + 1}
          </div>

          <span
            className={`text-xs hidden sm:block ${
              i <= current
                ? `${styles.textDark} font-medium`
                : "text-slate-400"
            }`}
          >
            {STEP_LABELS[i]}
          </span>

          {i < STEP_LIST.length - 1 && (
            <div
              className={`w-8 h-0.5 mx-1 ${
                i < current ? styles.line : "bg-slate-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

// ── Proof uploader ─────────────────────────────────────────
const ProofUploader = ({
  accentColor,
  proofLabel,
  extraProofContent,
  actionId,
  onDone,
}) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const styles =
    ACCENT_STYLES[accentColor] || ACCENT_STYLES.emerald;

  const handleFile = (f) => {
    if (!f) return;

    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError("");
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Pilih foto bukti terlebih dahulu.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("file", file);

      await api.post(`/actions/${actionId}/proof`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
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
        <h2 className="font-semibold text-slate-700 text-lg">
          Upload Foto Bukti
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          {proofLabel ||
            "Foto sebagai bukti bahwa aksimu benar-benar dilakukan."}
        </p>
      </div>

      {extraProofContent}

      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-56 object-cover rounded-xl border"
          />

          <button
            onClick={() => {
              setFile(null);
              setPreview(null);
            }}
            className="absolute top-2 right-2 bg-white border rounded-full px-2 py-1 text-xs text-slate-600 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            Ganti Foto
          </button>
        </div>
      ) : (
        <label
          className={`flex flex-col items-center justify-center w-full h-44 border-2 border-dashed ${styles.border} ${styles.soft} rounded-xl cursor-pointer transition-colors`}
        >
          <Camera className={`w-9 h-9 ${styles.text} mb-2`} />

          <span className="text-sm text-slate-500 font-medium">
            Klik untuk pilih foto
          </span>

          <span className="text-xs text-slate-400 mt-1">
            JPG · PNG · WEBP · maks. 10 MB
          </span>

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
        className={`w-full py-3 ${styles.button} text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
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

// ── Pending banner ─────────────────────────────────────────
const PendingBanner = ({
  pendingTitle,
  pendingDesc,
  onHome,
  onHistory,
}) => (
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
            "Aksimu sedang menunggu verifikasi admin."}
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

// ── Main layout ────────────────────────────────────────────
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

  const [step, setStep] = useState("form");
  const [actionId, setActionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const styles =
    ACCENT_STYLES[accentColor] || ACCENT_STYLES.emerald;

  const handleSubmitForm = async () => {
    if (!predictionId) {
      setError(
        "Aksi hanya bisa dicatat setelah scan sampah."
      );
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
          : detail ||
              "Gagal mencatat aksi. Silakan coba lagi."
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

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors group"
        >
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          Kembali
        </button>

        {/* Header */}
        <div className="text-center space-y-3">
          <div
            className={`w-16 h-16 mx-auto ${iconBg} rounded-full flex items-center justify-center`}
          >
            <Icon className={`w-8 h-8 ${iconColor}`} />
          </div>

          <h1 className="text-3xl font-bold text-slate-800">
            {title}
          </h1>

          {subtitle && (
            <p className="text-slate-500 text-sm">
              {subtitle}
            </p>
          )}
        </div>

        {/* Step */}
        {isLoggedIn && (
          <StepIndicator
            step={step}
            accentColor={accentColor}
          />
        )}

        {/* Guide */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
          <div>
            <h3 className="font-semibold text-slate-700 text-base">
              {guideTitle}
            </h3>

            {guideDesc && (
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                {guideDesc}
              </p>
            )}
          </div>

          {guideSteps.length > 0 && (
            <ol className="space-y-3">
              {guideSteps.map((s, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3"
                >
                  <span
                    className={`w-6 h-6 rounded-full ${styles.soft} ${styles.textDark} text-xs font-bold flex items-center justify-center shrink-0 mt-0.5`}
                  >
                    {i + 1}
                  </span>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {s}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* Form */}
        {step === "form" &&
          (isLoggedIn ? (
            <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
              <div>
                <h2 className="font-semibold text-slate-700 text-lg">
                  Sudah dilakukan?
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Isi keterangan dan upload bukti.
                </p>
              </div>

              {formContent}

              {error && (
                <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
                  {error}
                </p>
              )}

              <button
                onClick={handleSubmitForm}
                disabled={loading || !predictionId}
                className={`w-full py-3 ${styles.button} text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? "Menyimpan..." : formCTA}
              </button>
            </div>
          ) : (
            <GuestClaimBlock />
          ))}

        {/* Proof */}
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