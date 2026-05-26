/**
 * pages/action/BankSampahPage.jsx
 * Refactored — mitra selection tetap custom, tapi proof step pakai komponen
 * ProofUploader yang konsisten dengan semua action page lain.
 */

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  MapPin, Phone, Globe, CheckCircle, Clock, ArrowLeft, Camera,
} from "lucide-react";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import GuestClaimBlock from "@/components/scan/GuestClaimBlock";
import { CATEGORY_LABEL } from "@/constants/wasteConstants";

// ─── Mitra Card ─────────────────────────────────────────────
const MitraCard = ({ mitra, selected, onSelect }) => (
  <div
    onClick={onSelect}
    className={`bg-white rounded-2xl border p-5 cursor-pointer transition-all ${
      selected
        ? "border-blue-500 shadow-md ring-2 ring-blue-100"
        : "border-slate-200 hover:shadow-sm hover:border-blue-200"
    }`}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="space-y-1.5 flex-1 min-w-0">
        <h3 className="font-semibold text-slate-800">{mitra.name}</h3>
        {mitra.description && (
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
            {mitra.description}
          </p>
        )}
        <div className="flex flex-wrap gap-x-4 gap-y-1 pt-0.5">
          {mitra.address && (
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <MapPin size={11} />
              {mitra.city ? `${mitra.city} — ` : ""}{mitra.address}
            </span>
          )}
          {mitra.phone && (
            <a
              href={`tel:${mitra.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
            >
              <Phone size={11} />{mitra.phone}
            </a>
          )}
          {mitra.website && (
            <a
              href={mitra.website}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
            >
              <Globe size={11} />Website
            </a>
          )}
        </div>
        {mitra.accepted_waste && (
          <div className="flex flex-wrap gap-1 pt-1">
            {mitra.accepted_waste.split(",").map((w) => (
              <span
                key={w.trim()}
                className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full"
              >
                {CATEGORY_LABEL[w.trim()] ?? w.trim()}
              </span>
            ))}
          </div>
        )}
      </div>
      {selected && <CheckCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />}
    </div>
  </div>
);

// ─── Skeleton ───────────────────────────────────────────────
const SkeletonMitras = () => (
  <div className="space-y-3 animate-pulse">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-white rounded-2xl border p-5 space-y-2.5">
        <div className="h-4 bg-gray-200 rounded w-48" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-36" />
      </div>
    ))}
  </div>
);

// ─── Pending Banner ─────────────────────────────────────────
const PendingBanner = ({ mitraName, onHome, onHistory }) => (
  <section className="min-h-[70vh] flex items-center justify-center px-6">
    <div className="max-w-sm w-full bg-white rounded-2xl shadow-md border p-8 text-center space-y-5">
      <div className="w-20 h-20 mx-auto bg-amber-50 rounded-full flex items-center justify-center">
        <Clock className="w-10 h-10 text-amber-400" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Setor Tercatat! 🏦</h2>
        <p className="text-slate-500 text-sm leading-relaxed mt-2">
          Setoran ke <span className="font-semibold text-slate-700">{mitraName}</span> sedang
          menunggu verifikasi admin. Poin dan saldo kamu akan diperbarui setelah disetujui.
        </p>
      </div>
      <div className="flex gap-3">
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

// ─── Main ───────────────────────────────────────────────────
const BankSampahPage = () => {
  const navigate       = useNavigate();
  const location       = useLocation();
  const { isLoggedIn } = useAuth();

  const result       = location.state?.result ?? null;
  const predictionId = location.state?.prediction_id ?? null;
  const wasteLabel   = result ? (CATEGORY_LABEL[result] ?? result) : null;

  const [mitras,        setMitras]        = useState([]);
  const [mitraLoading,  setMitraLoading]  = useState(true);
  const [mitraError,    setMitraError]    = useState("");
  const [selectedMitra, setSelectedMitra] = useState(null);
  const [notes,         setNotes]         = useState("");
  const [step,          setStep]          = useState("list");
  const [actionId,      setActionId]      = useState(null);
  const [logLoading,    setLogLoading]    = useState(false);
  const [logError,      setLogError]      = useState("");
  const [proofFile,     setProofFile]     = useState(null);
  const [proofPreview,  setProofPreview]  = useState(null);
  const [proofLoading,  setProofLoading]  = useState(false);
  const [proofError,    setProofError]    = useState("");

  // Fetch mitra
  useEffect(() => {
    const fetchMitras = async () => {
      try {
        setMitraLoading(true);
        const { data } = result
          ? await api.get(`/mitra/by-waste/${result}`)
          : await api.get("/mitra/data");
        setMitras(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err.response?.status !== 401) setMitraError("Gagal mengambil data mitra.");
      } finally {
        setMitraLoading(false);
      }
    };
    fetchMitras();
  }, [result]);

  // Step 1: Create action
  const handleLog = async () => {
    if (!predictionId) {
      setLogError("Aksi hanya bisa dicatat setelah melakukan scan sampah.");
      return;
    }
    if (!selectedMitra) return;
    try {
      setLogLoading(true);
      setLogError("");
      const { data } = await api.post("/actions/", {
        action_type:   "bank_sampah",
        route:         "mitra",
        prediction_id: predictionId,
        partner_name:  selectedMitra.name,
        notes:         notes.trim() || undefined,
      });
      setActionId(data.id);
      setStep("proof");
    } catch (err) {
      const detail = err.response?.data?.detail;
      setLogError(
        Array.isArray(detail) ? detail.map((d) => d.msg).join(", ")
          : detail || "Gagal mencatat aksi."
      );
    } finally {
      setLogLoading(false);
    }
  };

  // Step 2: Upload proof
  const handleProofFile = (file) => {
    if (!file) return;
    setProofFile(file);
    setProofPreview(URL.createObjectURL(file));
    setProofError("");
  };

  const handleUploadProof = async () => {
    if (!proofFile) { setProofError("Pilih foto bukti terlebih dahulu."); return; }
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
      const detail = err.response?.data?.detail;
      setProofError(
        Array.isArray(detail) ? detail.map((d) => d.msg).join(", ")
          : detail || "Gagal mengupload foto bukti."
      );
    } finally {
      setProofLoading(false);
    }
  };

  if (step === "done") return (
    <PendingBanner
      mitraName={selectedMitra?.name}
      onHome={() => navigate("/dashboard")}
      onHistory={() => navigate("/history")}
    />
  );

  return (
    <section className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-2xl mx-auto space-y-6">

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Kembali
        </button>

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
            <MapPin className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Bank Sampah Mitra</h1>
          <p className="text-slate-500 text-sm">
            {wasteLabel
              ? `Setor ${wasteLabel} ke mitra terdekat dan tukar jadi poin.`
              : "Temukan mitra bank sampah aktif dan setor sampahmu."}
          </p>
          {!predictionId && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 inline-block px-3 py-1 rounded-full">
              ⚠️ Buka dari hasil scan untuk bisa klaim poin
            </p>
          )}
        </div>

        {/* Error fetch */}
        {mitraError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm text-center">
            {mitraError}
          </div>
        )}

        {/* Mitra list */}
        {mitraLoading ? (
          <SkeletonMitras />
        ) : mitras.length === 0 ? (
          <div className="bg-white rounded-2xl border p-10 text-center text-slate-400 text-sm">
            Belum ada mitra aktif untuk jenis sampah ini.
          </div>
        ) : (
          <div className="space-y-3">
            {mitras.map((mitra) => (
              <MitraCard
                key={mitra.id}
                mitra={mitra}
                selected={selectedMitra?.id === mitra.id}
                onSelect={() =>
                  setSelectedMitra((prev) => prev?.id === mitra.id ? null : mitra)
                }
              />
            ))}
          </div>
        )}

        {/* Step: konfirmasi & catat aksi */}
        {step === "list" && selectedMitra && (
          isLoggedIn ? (
            <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
              <div>
                <h2 className="font-semibold text-slate-700 text-lg">
                  Setor ke <span className="text-blue-600">{selectedMitra.name}</span>?
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Poin diberikan setelah admin memverifikasi foto buktimu.
                </p>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catatan tambahan... (opsional)"
                rows={2}
                maxLength={300}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
              {logError && (
                <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
                  {logError}
                </p>
              )}
              <button
                onClick={handleLog}
                disabled={logLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                {logLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Menyimpan...
                  </span>
                ) : "Lanjut → Upload Foto Bukti"}
              </button>
            </div>
          ) : (
            <GuestClaimBlock />
          )
        )}

        {/* Step: upload proof */}
        {step === "proof" && isLoggedIn && (
          <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
            <div>
              <h2 className="font-semibold text-slate-700 text-lg">Upload Foto Bukti Setoran</h2>
              <p className="text-sm text-slate-500 mt-1">
                Foto saat menyerahkan sampah ke{" "}
                <span className="font-semibold text-blue-600">{selectedMitra?.name}</span>.
              </p>
            </div>

            {proofPreview ? (
              <div className="relative">
                <img
                  src={proofPreview}
                  alt="Preview bukti"
                  className="w-full h-56 object-cover rounded-xl border"
                />
                <button
                  onClick={() => { setProofFile(null); setProofPreview(null); }}
                  className="absolute top-2 right-2 bg-white border rounded-full px-2 py-1 text-xs text-slate-600 hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  Ganti Foto
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-blue-300 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors">
                <Camera className="w-9 h-9 text-blue-400 mb-2" />
                <span className="text-sm text-slate-500 font-medium">Klik untuk pilih foto</span>
                <span className="text-xs text-slate-400 mt-1">JPG · PNG · WEBP</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => handleProofFile(e.target.files[0])}
                />
              </label>
            )}

            {proofError && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
                {proofError}
              </p>
            )}

            <button
              onClick={handleUploadProof}
              disabled={proofLoading || !proofFile}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              {proofLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Mengupload...
                </span>
              ) : "✓ Kirim Foto Bukti"}
            </button>
          </div>
        )}

      </div>
    </section>
  );
};

export default BankSampahPage;