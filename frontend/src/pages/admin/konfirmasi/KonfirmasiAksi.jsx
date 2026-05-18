import { useEffect, useState, useCallback } from "react";
import api from "@/lib/axios";
import dayjs from "dayjs";


// ======================================================
// LABEL & BADGE HELPERS
// ======================================================

const ACTION_TYPE_LABEL = {
  kompos:      "Kompos",
  bank_sampah: "Bank Sampah",
  daur_ulang:  "Daur Ulang",
  eco_brick:   "Eco Brick",
  reuse:       "Reuse",
  khusus:      "Penanganan Khusus",
};

const STATUS_CONFIG = {
  pending: {
    label: "Menunggu",
    className: "bg-yellow-100 text-yellow-700",
  },
  confirmed: {
    label: "Dikonfirmasi",
    className: "bg-green-100 text-green-700",
  },
  rejected: {
    label: "Ditolak",
    className: "bg-red-100 text-red-600",
  },
};


// ======================================================
// KONFIRMASI AKSI PAGE
// ======================================================

const KonfirmasiAksi = () => {
  const [actions, setActions]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);

  const LIMIT = 15;


  // ======================================================
  // FETCH ACTIONS
  // ======================================================

  const fetchActions = useCallback(async () => {
    try {
      setError("");
      setLoading(true);

      const { data } = await api.get("/admin/actions", {   // ← fix: hapus /api/v1
        params: {
          status: statusFilter || undefined,
          page,
          limit: LIMIT,
        },
      });

      setActions(Array.isArray(data.actions) ? data.actions : []);
      setTotalPages(Math.ceil((data.total || 1) / LIMIT));

    } catch (err) {
      console.error("Fetch actions error:", err);

      if (err.response?.status === 403) {
        setError("Akses admin ditolak");
      } else {
        setError("Gagal mengambil data aksi");
      }
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);


  useEffect(() => {
    fetchActions();
  }, [fetchActions]);

  // Reset page saat filter berubah
  useEffect(() => {
    setPage(1);
  }, [statusFilter]);


  // ======================================================
  // KONFIRMASI / TOLAK
  // ======================================================

  const updateStatus = async (actionId, newStatus) => {
    const label = newStatus === "confirmed" ? "mengonfirmasi" : "menolak";

    if (!confirm(`Yakin ingin ${label} aksi ini?`)) return;

    try {
      setActionLoading(actionId);

      await api.patch(`/admin/actions/${actionId}`, {  // ← fix: hapus /api/v1
        status: newStatus,
      });

      // Jika filter "pending", hapus dari list setelah diproses
      if (statusFilter === "pending") {
        setActions((prev) => prev.filter((a) => a.id !== actionId));
      } else {
        // Update inline
        setActions((prev) =>
          prev.map((a) =>
            a.id === actionId ? { ...a, status: newStatus } : a
          )
        );
      }
    } catch (err) {
      console.error("Update action error:", err);
      alert(`Gagal ${label} aksi`);
    } finally {
      setActionLoading(null);
    }
  };


  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Konfirmasi Aksi</h1>
          <p className="text-gray-500 text-sm mt-1">
            Tinjau dan konfirmasi aksi nyata yang dilaporkan pengguna
          </p>
        </div>
      </div>


      {/* FILTER STATUS */}
      <div className="flex gap-2 flex-wrap">
        {["pending", "confirmed", "rejected", ""].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
              statusFilter === s
                ? "bg-black text-white border-black"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
            }`}
          >
            {s === ""
              ? "Semua"
              : s === "pending"
              ? "Menunggu"
              : s === "confirmed"
              ? "Dikonfirmasi"
              : "Ditolak"}
          </button>
        ))}
      </div>


      {/* ERROR */}
      {error && (
        <div className="bg-red-100 text-red-600 p-4 rounded-xl">
          {error}
        </div>
      )}


      {/* LIST AKSI */}
      {loading ? (
        <SkeletonCards count={5} />
      ) : actions.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-12 text-center text-gray-400">
          {statusFilter === "pending"
            ? "Tidak ada aksi yang menunggu konfirmasi"
            : "Tidak ada data aksi"}
        </div>
      ) : (
        <div className="space-y-4">
          {actions.map((action) => (
            <ActionCard
              key={action.id}
              action={action}
              onConfirm={() => updateStatus(action.id, "confirmed")}
              onReject={() => updateStatus(action.id, "rejected")}
              isLoading={actionLoading === action.id}
            />
          ))}
        </div>
      )}


      {/* PAGINATION */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl border text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            ← Prev
          </button>

          <span className="px-4 py-2 text-sm text-gray-600">
            {page} / {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-xl border text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};


// ======================================================
// ACTION CARD
// ======================================================

const ActionCard = ({ action, onConfirm, onReject, isLoading }) => {
  const statusCfg = STATUS_CONFIG[action.status] || STATUS_CONFIG.pending;

  return (
    <div className="bg-white rounded-2xl shadow p-5 space-y-4">

      {/* TOP ROW */}
      <div className="flex items-start justify-between gap-4 flex-wrap">

        <div className="space-y-1">
          {/* Aksi & badge status */}
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-800">
              {ACTION_TYPE_LABEL[action.action_type] || action.action_type}
            </h3>

            <span
              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusCfg.className}`}
            >
              {statusCfg.label}
            </span>
          </div>

          {/* Meta info */}
          <div className="flex gap-4 text-sm text-gray-500 flex-wrap">
            <span>
              👤 {action.user?.full_name || action.user?.email || `User #${action.user_id}`}
            </span>

            {action.partner_name && (
              <span>🏢 {action.partner_name}</span>
            )}

            <span>
              🕒 {dayjs(action.created_at).format("DD MMM YYYY, HH:mm")}
            </span>

            <span className="font-medium text-green-700">
              +{action.points_earned} poin
            </span>
          </div>
        </div>

        {/* Scan terkait */}
        {action.prediction_id && (
          <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
            Scan #{action.prediction_id}
          </span>
        )}
      </div>

      {/* CATATAN USER */}
      {action.notes && (
        <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-700 italic">
          "{action.notes}"
        </div>
      )}

      {/* TOMBOL AKSI — hanya tampil jika status pending */}
      {action.status === "pending" && (
        <div className="flex gap-3 pt-1">
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Memproses..." : "✓ Konfirmasi"}
          </button>

          <button
            onClick={onReject}
            disabled={isLoading}
            className="flex-1 py-2 rounded-xl bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Memproses..." : "✕ Tolak"}
          </button>
        </div>
      )}
    </div>
  );
};


// ======================================================
// SKELETON CARDS
// ======================================================

const SkeletonCards = ({ count = 4 }) => (
  <div className="space-y-4 animate-pulse">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="bg-white rounded-2xl shadow p-5 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-48" />
        <div className="h-4 bg-gray-200 rounded w-72" />
        <div className="h-10 bg-gray-200 rounded-xl" />
        <div className="flex gap-3">
          <div className="h-10 bg-gray-200 rounded-xl flex-1" />
          <div className="h-10 bg-gray-200 rounded-xl flex-1" />
        </div>
      </div>
    ))}
  </div>
);


export default KonfirmasiAksi;