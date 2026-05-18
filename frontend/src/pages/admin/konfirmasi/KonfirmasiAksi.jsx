import { useEffect, useState, useCallback } from "react";
import api from "@/lib/axios";
import dayjs from "dayjs";

// ======================================================
// LABEL & BADGE HELPERS
// ======================================================

const ACTION_TYPE_LABEL = {
  kompos: "Kompos",
  bank_sampah: "Bank Sampah",
  daur_ulang: "Daur Ulang",
  eco_brick: "Eco Brick",
  reuse: "Reuse",
  khusus: "Penanganan Khusus",
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
// PAGE
// ======================================================

const KonfirmasiAksi = () => {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  // ======================================================
  // FETCH PENDING ACTIONS
  // ======================================================

  const fetchActions = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // BACKEND BARU
      // GET /api/v1/actions/pending

      const { data } = await api.get("/actions/pending");

      console.log("Pending actions:", data);

      // support array langsung / object
      if (Array.isArray(data)) {
        setActions(data);
      } else if (Array.isArray(data.actions)) {
        setActions(data.actions);
      } else {
        setActions([]);
      }

    } catch (err) {
      console.error("Fetch actions error:", err);

      if (err.response?.status === 401) {
        setError("Silakan login terlebih dahulu");
      } else if (err.response?.status === 403) {
        setError("Akses admin ditolak");
      } else {
        setError("Gagal mengambil data aksi");
      }

    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActions();
  }, [fetchActions]);

  // ======================================================
  // VERIFY ACTION
  // ======================================================

  const updateStatus = async (actionId, newStatus) => {
    const isApprove = newStatus === "confirmed";

    const label = isApprove
      ? "mengonfirmasi"
      : "menolak";

    const confirmed = window.confirm(
      `Yakin ingin ${label} aksi ini?`
    );

    if (!confirmed) return;

    try {
      setActionLoading(actionId);

      // PATCH /api/v1/actions/{id}/verify

      await api.patch(
        `/actions/${actionId}/verify`,
        {
          status: newStatus,
        }
      );

      // Hapus dari list setelah diproses
      setActions((prev) =>
        prev.filter((a) => a.id !== actionId)
      );

    } catch (err) {
      console.error("Verify action error:", err);

      // Jika backend ternyata memakai field lain
      if (err.response?.status === 422) {
        alert(
          "Request verify tidak sesuai schema backend"
        );
      } else {
        alert(`Gagal ${label} aksi`);
      }

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
          <h1 className="text-3xl font-bold">
            Konfirmasi Aksi
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Tinjau dan verifikasi aksi pengguna
          </p>
        </div>

        <button
          onClick={fetchActions}
          className="px-4 py-2 rounded-xl bg-black text-white hover:bg-gray-800 transition"
        >
          Refresh
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-100 text-red-600 p-4 rounded-xl">
          {error}
        </div>
      )}

      {/* LOADING */}
      {loading ? (
        <SkeletonCards count={5} />
      ) : actions.length === 0 ? (

        <div className="bg-white rounded-2xl shadow p-12 text-center text-gray-400">
          Tidak ada aksi yang menunggu konfirmasi
        </div>

      ) : (

        <div className="space-y-4">
          {actions.map((action) => (
            <ActionCard
              key={action.id}
              action={action}
              onConfirm={() =>
                updateStatus(action.id, "confirmed")
              }
              onReject={() =>
                updateStatus(action.id, "rejected")
              }
              isLoading={actionLoading === action.id}
            />
          ))}
        </div>

      )}
    </div>
  );
};

// ======================================================
// ACTION CARD
// ======================================================

const ActionCard = ({
  action,
  onConfirm,
  onReject,
  isLoading,
}) => {

  const statusCfg =
    STATUS_CONFIG[action.status] ||
    STATUS_CONFIG.pending;

  return (
    <div className="bg-white rounded-2xl shadow p-5 space-y-4">

      {/* TOP */}
      <div className="flex items-start justify-between gap-4 flex-wrap">

        <div className="space-y-2">

          {/* TITLE */}
          <div className="flex items-center gap-2 flex-wrap">

            <h3 className="font-semibold text-gray-800">
              {ACTION_TYPE_LABEL[action.action_type] ||
                action.action_type}
            </h3>

            <span
              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusCfg.className}`}
            >
              {statusCfg.label}
            </span>

          </div>

          {/* META */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">

            <span>
              👤{" "}
              {action.user?.full_name ||
                action.user?.email ||
                `User #${action.user_id}`}
            </span>

            {action.partner_name && (
              <span>
                🏢 {action.partner_name}
              </span>
            )}

            <span>
              🕒{" "}
              {dayjs(action.created_at).format(
                "DD MMM YYYY, HH:mm"
              )}
            </span>

            <span className="font-medium text-green-700">
              +{action.points_earned} poin
            </span>

          </div>
        </div>

        {/* PREDICTION */}
        {action.prediction_id && (
          <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
            Scan #{action.prediction_id}
          </span>
        )}
      </div>

      {/* NOTES */}
      {action.notes && (
        <div className="bg-gray-50 rounded-xl p-3 text-sm italic text-gray-700">
          "{action.notes}"
        </div>
      )}

      {/* PROOF IMAGE */}
      {action.proof_image_path && (
        <div>
          <img
            src={action.proof_image_path}
            alt="Proof"
            className="rounded-xl max-h-72 object-cover border"
          />
        </div>
      )}

      {/* BUTTONS */}
      {action.status === "pending" && (
        <div className="flex gap-3 pt-2">

          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition disabled:opacity-50"
          >
            {isLoading
              ? "Memproses..."
              : "✓ Konfirmasi"}
          </button>

          <button
            onClick={onReject}
            disabled={isLoading}
            className="flex-1 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-100 transition disabled:opacity-50"
          >
            {isLoading
              ? "Memproses..."
              : "✕ Tolak"}
          </button>

        </div>
      )}
    </div>
  );
};

// ======================================================
// SKELETON
// ======================================================

const SkeletonCards = ({ count = 5 }) => (
  <div className="space-y-4 animate-pulse">

    {[...Array(count)].map((_, i) => (
      <div
        key={i}
        className="bg-white rounded-2xl shadow p-5 space-y-3"
      >

        <div className="h-5 w-48 bg-gray-200 rounded" />

        <div className="h-4 w-72 bg-gray-200 rounded" />

        <div className="h-24 bg-gray-200 rounded-xl" />

        <div className="flex gap-3">

          <div className="h-10 flex-1 bg-gray-200 rounded-xl" />

          <div className="h-10 flex-1 bg-gray-200 rounded-xl" />

        </div>
      </div>
    ))}

  </div>
);

export default KonfirmasiAksi;