import { useEffect, useState, useCallback } from "react";
import { CheckCircle, XCircle, RefreshCw, MapPin, Phone, Mail, Globe, Store } from "lucide-react";
import api from "@/lib/axios";

// ─── Helpers ────────────────────────────────────────────────
const MITRA_TYPE_LABEL = {
  bank_sampah: "Bank Sampah",
  daur_ulang:  "Daur Ulang",
  pengepul:    "Pengepul",
  komunitas:   "Komunitas",
};

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID", {
        day: "numeric", month: "long", year: "numeric",
      })
    : "-";

// ─── Skeleton ────────────────────────────────────────────────
const SkeletonCards = () => (
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 animate-pulse">
        <div className="flex justify-between">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-36" />
            <div className="h-3 bg-gray-200 rounded w-24" />
          </div>
          <div className="h-6 bg-gray-200 rounded-full w-20" />
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
        <div className="flex gap-2 pt-2 border-t">
          <div className="h-9 bg-gray-200 rounded-xl flex-1" />
          <div className="h-9 bg-gray-200 rounded-xl flex-1" />
        </div>
      </div>
    ))}
  </div>
);

// ─── Mitra Card ──────────────────────────────────────────────
const MitraCard = ({ mitra, onApprove, onReject, processing }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-4">

    {/* Header */}
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
          <Store className="w-5 h-5 text-emerald-700" />
        </div>
        <div>
          <p className="font-bold text-gray-900 leading-tight">{mitra.name}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {MITRA_TYPE_LABEL[mitra.mitra_type] || mitra.mitra_type}
          </p>
        </div>
      </div>
      <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
        Pending
      </span>
    </div>

    {/* Info */}
    <div className="space-y-2 text-sm text-gray-600">
      {mitra.address && (
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
          <span className="line-clamp-2">{mitra.address}{mitra.city ? `, ${mitra.city}` : ""}</span>
        </div>
      )}
      {mitra.phone && (
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-gray-400 shrink-0" />
          <span>{mitra.phone}</span>
        </div>
      )}
      {mitra.email && (
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="truncate">{mitra.email}</span>
        </div>
      )}
      {mitra.website && (
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-gray-400 shrink-0" />
          <a
            href={mitra.website}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate text-blue-600 hover:underline"
          >
            {mitra.website}
          </a>
        </div>
      )}
    </div>

    {/* Sampah diterima */}
    {mitra.accepted_waste && (
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1.5">
          Sampah Diterima
        </p>
        <div className="flex flex-wrap gap-1.5">
          {mitra.accepted_waste.split(",").map((w) => (
            <span
              key={w}
              className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100"
            >
              {w.trim()}
            </span>
          ))}
        </div>
      </div>
    )}

    {/* Deskripsi */}
    {mitra.description && (
      <p className="text-sm text-gray-500 line-clamp-2">{mitra.description}</p>
    )}

    {/* Tanggal daftar */}
    <p className="text-xs text-gray-400">Daftar: {formatDate(mitra.created_at)}</p>

    {/* Actions */}
    <div className="flex gap-2 pt-1 border-t border-gray-50">
      <button
        onClick={() => onReject(mitra)}
        disabled={processing === mitra.id}
        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-red-200 text-sm text-red-500 hover:bg-red-50 transition disabled:opacity-50"
      >
        <XCircle className="w-4 h-4" />
        Tolak
      </button>
      <button
        onClick={() => onApprove(mitra)}
        disabled={processing === mitra.id}
        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 text-sm text-white hover:bg-emerald-700 transition disabled:opacity-50"
      >
        {processing === mitra.id ? (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <CheckCircle className="w-4 h-4" />
        )}
        Setujui
      </button>
    </div>
  </div>
);

// ─── Modal Konfirmasi ────────────────────────────────────────
const ConfirmModal = ({ config, rejectReason, setRejectReason, onProcess, onClose, isProcessing }) => {
  if (!config.isOpen) return null;
  const isApprove = config.type === "approve";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className={`p-6 border-b flex items-center gap-4 ${isApprove ? "bg-emerald-50/50" : "bg-red-50/50"}`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isApprove ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}>
            {isApprove
              ? <CheckCircle className="w-6 h-6" />
              : <XCircle className="w-6 h-6" />
            }
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {isApprove ? "Setujui Mitra?" : "Tolak Mitra?"}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5 font-medium">{config.mitra?.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {isApprove
                ? "Mitra akan langsung aktif dan bisa menerima setoran."
                : "Mitra tidak akan bisa menerima setoran."}
            </p>
          </div>
        </div>

        {/* Body — alasan penolakan */}
        {!isApprove && (
          <div className="p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Alasan Penolakan <span className="text-red-500">*</span>
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Contoh: Dokumen tidak lengkap, alamat tidak valid..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none bg-gray-50/50"
              autoFocus
            />
          </div>
        )}

        {/* Footer */}
        <div className="p-6 pt-2 flex gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={onProcess}
            disabled={isProcessing}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition flex items-center justify-center gap-2 disabled:opacity-70
              ${isApprove ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}`}
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Memproses...
              </>
            ) : isApprove ? "Ya, Setujui" : "Tolak Mitra"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ───────────────────────────────────────────────
const VerifikasiMitra = () => {
  const [mitras,       setMitras]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [processing,   setProcessing]   = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [toast,        setToast]        = useState(null);
  const [modal,        setModal]        = useState({ isOpen: false, type: null, mitra: null });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchMitras = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get("/admin/mitra/pending");
      setMitras(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.response?.status === 403) setError("Akses admin ditolak");
      else setError("Gagal mengambil data mitra pending");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMitras(); }, [fetchMitras]);

  const openApprove = (mitra) => {
    setRejectReason("");
    setModal({ isOpen: true, type: "approve", mitra });
  };

  const openReject = (mitra) => {
    setRejectReason("");
    setModal({ isOpen: true, type: "reject", mitra });
  };

  const closeModal = () => {
    if (isProcessing) return;
    setModal({ isOpen: false, type: null, mitra: null });
    setRejectReason("");
  };

  const handleProcess = async () => {
    const { type, mitra } = modal;

    if (type === "reject" && !rejectReason.trim()) {
      alert("Alasan penolakan tidak boleh kosong.");
      return;
    }

    try {
      setIsProcessing(true);
      setProcessing(mitra.id);

      const payload =
        type === "approve"
          ? { status: "approved" }
          : { status: "rejected", rejection_reason: rejectReason.trim() };

      await api.patch(`/admin/mitra/${mitra.id}/verify`, payload);

      setMitras((prev) => prev.filter((m) => m.id !== mitra.id));
      closeModal();
      showToast(
        type === "approve"
          ? `✅ ${mitra.name} berhasil disetujui!`
          : `❌ ${mitra.name} ditolak.`,
        type === "approve" ? "success" : "error"
      );
    } catch (err) {
      const detail = err.response?.data?.detail;
      alert(detail || `Gagal ${type === "approve" ? "menyetujui" : "menolak"} mitra`);
    } finally {
      setIsProcessing(false);
      setProcessing(null);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition
          ${toast.type === "success" ? "bg-emerald-600" : "bg-red-500"}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Verifikasi Mitra
          </h1>
          <p className="text-sm text-gray-500 mt-1.5 font-medium">
            Tinjau dan setujui pendaftaran mitra baru yang menunggu verifikasi.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!loading && mitras.length > 0 && (
            <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full border border-amber-100 font-semibold text-sm">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              {mitras.length} Menunggu
            </div>
          )}
          <button
            onClick={fetchMitras}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-xl flex items-start gap-3">
          <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-medium text-sm">{error}</p>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <SkeletonCards />
      ) : mitras.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-16 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Semua mitra sudah diverifikasi</h3>
          <p className="text-sm text-gray-500">Tidak ada pendaftaran mitra yang menunggu saat ini.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {mitras.map((mitra) => (
            <MitraCard
              key={mitra.id}
              mitra={mitra}
              onApprove={openApprove}
              onReject={openReject}
              processing={processing}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <ConfirmModal
        config={modal}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        onProcess={handleProcess}
        onClose={closeModal}
        isProcessing={isProcessing}
      />
    </div>
  );
};

export default VerifikasiMitra;