import { useEffect, useState, useCallback } from "react";
import { RefreshCw, CheckCircle, XCircle, Clock } from "lucide-react";
import api from "@/lib/axios";

const ACTION_TYPE_LABEL = {
  kompos:      "Kompos",
  bank_sampah: "Bank Sampah",
  daur_ulang:  "Daur Ulang",
  eco_brick:   "Eco Brick",
  reuse:       "Reuse",
  khusus:      "Penanganan Khusus",
};

const STATUS_CONFIG = {
  pending:  { label: "Pending",       Icon: Clock,       cls: "bg-amber-100 text-amber-700" },
  approved: { label: "Dikonfirmasi",  Icon: CheckCircle, cls: "bg-green-100 text-green-700" },
  rejected: { label: "Ditolak",       Icon: XCircle,     cls: "bg-red-100 text-red-600"     },
};

/**
 * Konversi weight_gram (integer dari backend) → tampilan kg/g.
 * Contoh: 1500 → "1.5 kg" | 500 → "500 g" | null → null
 */
const formatWeight = (gram) => {
  if (!gram) return null;
  if (gram >= 1000) return `${(gram / 1000).toFixed(gram % 1000 === 0 ? 0 : 1)} kg`;
  return `${gram} g`;
};

const MitraRiwayat = () => {
  const [actions,  setActions]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [filter,   setFilter]   = useState("all");
  const [selected, setSelected] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get("/mitra/mine/actions");
      const list = Array.isArray(data) ? data : [];
      setActions(list);
    } catch (err) {
      if (err.response?.status === 404) setError("Anda belum memiliki mitra terdaftar");
      else setError("Gagal memuat riwayat aksi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = filter === "all"
    ? actions
    : actions.filter((a) => a.status === filter);

  const counts = {
    all:      actions.length,
    pending:  actions.filter((a) => a.status === "pending").length,
    approved: actions.filter((a) => a.status === "approved").length,
    rejected: actions.filter((a) => a.status === "rejected").length,
  };

  const DetailModal = ({ action, onClose }) => {
    const proofUrl = action.proof_url || action.proof_image_path;
    const statusCfg = STATUS_CONFIG[action.status] || STATUS_CONFIG.pending;
    const { Icon } = statusCfg;
    const weightDisplay = formatWeight(action.weight_gram);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[85vh] flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="text-lg font-bold text-gray-900">Detail Riwayat Aksi</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl">✕</button>
          </div>

          <div className="overflow-y-auto px-6 py-5 flex-1 space-y-4">
            <div className="flex items-center gap-2">
              <span className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full ${statusCfg.cls}`}>
                <Icon className="w-4 h-4" />
                {statusCfg.label}
              </span>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Tipe Aksi</span>
                <span className="font-medium text-gray-900">
                  {ACTION_TYPE_LABEL[action.action_type] || action.action_type}
                </span>
              </div>
              {action.route && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Jalur</span>
                  <span className="font-medium text-gray-900 capitalize">{action.route}</span>
                </div>
              )}
              {weightDisplay && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Berat</span>
                  <span className="font-medium text-gray-900">{weightDisplay}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Tanggal</span>
                <span className="font-medium text-gray-900">
                  {action.created_at
                    ? new Date(action.created_at).toLocaleDateString("id-ID", {
                        day: "numeric", month: "long", year: "numeric",
                      })
                    : "-"}
                </span>
              </div>
              {action.balance_earned > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Saldo Didapat</span>
                  <span className="font-medium text-green-700">
                    Rp {action.balance_earned.toLocaleString("id-ID")}
                  </span>
                </div>
              )}
              {action.points_earned > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Poin Didapat</span>
                  <span className="font-medium text-amber-700">
                    +{action.points_earned} poin
                  </span>
                </div>
              )}
              {action.rejection_reason && (
                <div className="pt-2 border-t">
                  <p className="text-gray-500 mb-1">Alasan Penolakan</p>
                  <p className="text-red-600">{action.rejection_reason}</p>
                </div>
              )}
              {action.notes && (
                <div className="pt-2 border-t">
                  <p className="text-gray-500 mb-1">Catatan</p>
                  <p className="text-gray-700">{action.notes}</p>
                </div>
              )}
            </div>

            {proofUrl && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">Foto Bukti</p>
                <div className="rounded-xl overflow-hidden border">
                  <img src={proofUrl} alt="Bukti" className="w-full object-contain max-h-56" />
                </div>
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Riwayat Verifikasi</h1>
          <p className="text-sm text-gray-500 mt-1">Histori semua aksi setoran yang pernah diproses</p>
        </div>
        <button
          onClick={fetchAll}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: "all",      label: "Semua",       color: "gray"  },
          { key: "pending",  label: "Pending",      color: "amber" },
          { key: "approved", label: "Dikonfirmasi", color: "green" },
          { key: "rejected", label: "Ditolak",      color: "red"   },
        ].map((tab) => {
          const active = filter === tab.key;
          const colorMap = {
            gray:  active ? "bg-gray-800 text-white"  : "bg-gray-100 text-gray-600 hover:bg-gray-200",
            amber: active ? "bg-amber-500 text-white" : "bg-amber-50 text-amber-700 hover:bg-amber-100",
            green: active ? "bg-green-600 text-white" : "bg-green-50 text-green-700 hover:bg-green-100",
            red:   active ? "bg-red-500 text-white"   : "bg-red-50 text-red-600 hover:bg-red-100",
          };
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 ${colorMap[tab.color]}`}
            >
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? "bg-white/20" : "bg-white/70"}`}>
                {counts[tab.key]}
              </span>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-white rounded-2xl border animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <span className="text-5xl block mb-3">📋</span>
          <p className="font-semibold text-gray-500">Tidak ada riwayat aksi</p>
          <p className="text-sm text-gray-400 mt-1">
            {filter === "all" ? "Belum ada aksi yang diproses" : `Tidak ada aksi dengan status "${filter}"`}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-50">
            {filtered.map((action) => {
              const statusCfg = STATUS_CONFIG[action.status] || STATUS_CONFIG.pending;
              const { Icon } = statusCfg;
              const weightDisplay = formatWeight(action.weight_gram);

              return (
                <button
                  key={action.id}
                  onClick={() => setSelected(action)}
                  className="w-full px-6 py-4 flex items-center justify-between gap-4 hover:bg-gray-50 transition text-left"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {ACTION_TYPE_LABEL[action.action_type] || action.action_type}
                      {action.route && (
                        <span className="text-gray-400 font-normal ml-2 capitalize">
                          · via {action.route}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {action.created_at
                        ? new Date(action.created_at).toLocaleDateString("id-ID", {
                            day: "numeric", month: "short", year: "numeric",
                          })
                        : "-"}
                      {weightDisplay && ` · ${weightDisplay}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${statusCfg.cls}`}>
                      <Icon className="w-3.5 h-3.5" />
                      {statusCfg.label}
                    </span>
                    <span className="text-gray-400 text-xs">→</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {selected && (
        <DetailModal action={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
};

export default MitraRiwayat;