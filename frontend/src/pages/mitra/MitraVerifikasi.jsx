import { useEffect, useState, useCallback } from "react";
import { CheckCircle, XCircle, Eye, RefreshCw } from "lucide-react";
import api from "@/lib/axios";

// ─── Helpers ────────────────────────────────────────────────
const ACTION_TYPE_LABEL = {
  kompos:      "Kompos",
  bank_sampah: "Bank Sampah",
  daur_ulang:  "Daur Ulang",
  eco_brick:   "Eco Brick",
  reuse:       "Reuse",
  khusus:      "Penanganan Khusus",
};

/**
 * Konversi weight_gram (integer dari backend) → tampilan kg.
 * Contoh: 1500 → "1.5 kg" | 500 → "500 g" | null → null
 */
const formatWeight = (gram) => {
  if (!gram) return null;
  if (gram >= 1000) return `${(gram / 1000).toFixed(gram % 1000 === 0 ? 0 : 1)} kg`;
  return `${gram} g`;
};

// ─── Proof Modal ────────────────────────────────────────────
const ProofModal = ({ action, onClose, onVerify, verifyLoading }) => {
  const proofUrl = action.proof_url || action.proof_image_path;
  const weightDisplay = formatWeight(action.weight_gram);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col">

        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">Detail Aksi Setoran</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl">✕</button>
        </div>

        <div className="overflow-y-auto px-6 py-5 flex-1 space-y-4">

          {/* Info aksi */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">Tipe Aksi</span>
              <span className="text-sm font-semibold text-gray-900">
                {ACTION_TYPE_LABEL[action.action_type] || action.action_type}
              </span>
            </div>
            {action.route && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">Jalur</span>
                <span className="text-sm font-semibold text-gray-900 capitalize">{action.route}</span>
              </div>
            )}
            {weightDisplay && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">Berat</span>
                <span className="text-sm font-semibold text-gray-900">{weightDisplay}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">Tanggal</span>
              <span className="text-sm font-semibold text-gray-900">
                {action.created_at
                  ? new Date(action.created_at).toLocaleDateString("id-ID", {
                      weekday: "short", day: "numeric", month: "long", year: "numeric",
                    })
                  : "-"}
              </span>
            </div>
            {action.notes && (
              <div className="pt-1 border-t">
                <span className="text-xs text-gray-500 uppercase tracking-wide font-medium block mb-1">Catatan</span>
                <p className="text-sm text-gray-700">{action.notes}</p>
              </div>
            )}
          </div>

          {/* Foto bukti */}
          {proofUrl ? (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">Foto Bukti</p>
              <div className="rounded-xl overflow-hidden border border-gray-200">
                <img
                  src={proofUrl}
                  alt="Bukti setoran"
                  className="w-full object-contain max-h-64"
                />
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center text-sm text-amber-700">
              ⚠️ Belum ada foto bukti yang diunggah
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 py-4 border-t">
          <button
            onClick={() => onVerify(action.id, "rejected")}
            disabled={verifyLoading}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-sm font-semibold transition disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" />
            Tolak
          </button>
          <button
            onClick={() => onVerify(action.id, "approved")}
            disabled={verifyLoading}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 text-sm font-semibold transition disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" />
            Konfirmasi
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Action Card ────────────────────────────────────────────
const ActionCard = ({ action, onVerify, verifyLoading, onViewDetail }) => {
  const hasProof = Boolean(action.proof_url || action.proof_image_path);
  const weightDisplay = formatWeight(action.weight_gram);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-gray-900">
            {ACTION_TYPE_LABEL[action.action_type] || action.action_type}
          </p>
          {action.route && (
            <p className="text-xs text-gray-500 mt-0.5 capitalize">
              via {action.route}
            </p>
          )}
        </div>
        <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
          Pending
        </span>
      </div>

      {/* Detail */}
      <div className="flex gap-4 text-sm text-gray-600">
        {weightDisplay && (
          <div className="flex items-center gap-1">
            <span>⚖️</span>
            <span>{weightDisplay}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <span>📅</span>
          <span>
            {action.created_at
              ? new Date(action.created_at).toLocaleDateString("id-ID", {
                  day: "numeric", month: "short",
                })
              : "-"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span>{hasProof ? "📷" : "🚫"}</span>
          <span className={hasProof ? "text-green-600" : "text-gray-400"}>
            {hasProof ? "Ada foto" : "Belum ada foto"}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1 border-t border-gray-50">
        <button
          onClick={() => onViewDetail(action)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
        >
          <Eye className="w-4 h-4" />
          Detail
        </button>
        <button
          onClick={() => onVerify(action.id, "rejected")}
          disabled={verifyLoading === action.id}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-red-200 text-sm text-red-500 hover:bg-red-50 transition disabled:opacity-50"
        >
          <XCircle className="w-4 h-4" />
          Tolak
        </button>
        <button
          onClick={() => onVerify(action.id, "approved")}
          disabled={verifyLoading === action.id}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-green-600 text-sm text-white hover:bg-green-700 transition disabled:opacity-50"
        >
          <CheckCircle className="w-4 h-4" />
          Konfirmasi
        </button>
      </div>
    </div>
  );
};

// ─── Skeleton ───────────────────────────────────────────────
const SkeletonCards = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4 animate-pulse">
        <div className="flex justify-between">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-32" />
            <div className="h-3 bg-gray-200 rounded w-20" />
          </div>
          <div className="h-6 bg-gray-200 rounded-full w-16" />
        </div>
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="flex gap-2 border-t pt-4">
          <div className="h-9 bg-gray-200 rounded-xl flex-1" />
          <div className="h-9 bg-gray-200 rounded-xl flex-1" />
          <div className="h-9 bg-gray-200 rounded-xl flex-1" />
        </div>
      </div>
    ))}
  </div>
);

// ─── Main Page ──────────────────────────────────────────────
const MitraVerifikasi = () => {
  const [actions,        setActions]        = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState("");
  const [verifyLoading,  setVerifyLoading]  = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [toast,          setToast]          = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchActions = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get("/mitra/mine/actions/pending");
      const list = Array.isArray(data) ? data : [];
      setActions(list);
    } catch (err) {
      if (err.response?.status === 401)      setError("Silakan login terlebih dahulu");
      else if (err.response?.status === 403) setError("Akses tidak diizinkan");
      else if (err.response?.status === 404) setError("Anda belum memiliki mitra terdaftar");
      else                                   setError("Gagal mengambil data aksi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchActions(); }, [fetchActions]);

  const handleVerify = async (actionId, newStatus) => {
    const label = newStatus === "approved" ? "mengkonfirmasi" : "menolak";
    if (!window.confirm(`Yakin ingin ${label} aksi ini?`)) return;

    try {
      setVerifyLoading(actionId);
      await api.patch(`/mitra/mine/actions/${actionId}/verify`, { status: newStatus });
      setActions((prev) => prev.filter((a) => a.id !== actionId));
      setSelectedAction(null);
      showToast(
        newStatus === "approved" ? "✅ Aksi berhasil dikonfirmasi!" : "❌ Aksi ditolak",
        newStatus === "approved" ? "success" : "error"
      );
    } catch (err) {
      showToast("Gagal memproses verifikasi", "error");
    } finally {
      setVerifyLoading(null);
    }
  };

  return (
    <div className="p-6 space-y-6">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition ${
          toast.type === "success" ? "bg-green-600" : "bg-red-500"
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Verifikasi Setoran</h1>
          <p className="text-sm text-gray-500 mt-1">
            Konfirmasi atau tolak aksi setoran sampah dari warga
          </p>
        </div>
        <div className="flex items-center gap-3">
          {actions.length > 0 && (
            <span className="bg-amber-100 text-amber-700 text-sm font-semibold px-3 py-1 rounded-full">
              {actions.length} Pending
            </span>
          )}
          <button
            onClick={fetchActions}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <SkeletonCards />
      ) : actions.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
          <span className="text-6xl block mb-4">🎉</span>
          <p className="text-lg font-semibold text-gray-700">Semua setoran sudah diproses!</p>
          <p className="text-sm text-gray-400 mt-2">
            Tidak ada aksi yang menunggu verifikasi saat ini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {actions.map((action) => (
            <ActionCard
              key={action.id}
              action={action}
              onVerify={handleVerify}
              verifyLoading={verifyLoading}
              onViewDetail={setSelectedAction}
            />
          ))}
        </div>
      )}

      {selectedAction && (
        <ProofModal
          action={selectedAction}
          onClose={() => setSelectedAction(null)}
          onVerify={handleVerify}
          verifyLoading={verifyLoading}
        />
      )}
    </div>
  );
};

export default MitraVerifikasi;