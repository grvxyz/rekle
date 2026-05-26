import dayjs from "dayjs";
import "dayjs/locale/id"; // Pastikan sudah install dayjs
import { useState } from "react";
import { ACTION_TYPE_LABEL, STATUS_CONFIG } from "./constants";

// Atur bahasa dayjs ke Indonesia
dayjs.locale("id");

// Praktik Terbaik: Gunakan Environment Variable agar dinamis saat Production (Vite)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function buildImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  // Memastikan tidak ada double slash (//) saat menggabungkan URL
  return `${BASE_URL.replace(/\/$/, "")}/${path.replace(/^\/+/, "")}`;
}

const ActionCard = ({ action, onConfirm, onReject, isLoading }) => {
  const [imageError, setImageError] = useState(false);

  // Fallback status
  const statusCfg = STATUS_CONFIG[action.status] || STATUS_CONFIG.pending;
  
  // Fallback poin (menyesuaikan berbagai kemungkinan response backend)
  const poin = action.points_earned || action.reward_amount || action.points || 0;

  const proofUrl = buildImageUrl(action.proof_image_path);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6 space-y-5 transition-all hover:shadow-md">
      {/* HEADER & INFO */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="space-y-3">
          
          {/* Judul & Badge Status */}
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-lg font-bold text-gray-900 leading-none">
              {ACTION_TYPE_LABEL[action.action_type] || action.action_type}
            </h3>
            <span
              className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full border ${statusCfg.className || "bg-gray-100 text-gray-600 border-gray-200"}`}
            >
              {statusCfg.label || action.status}
            </span>
          </div>

          {/* Metadata Aksi */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 font-medium">
            <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
              <span className="text-base">👤</span> 
              <span className="text-gray-700">
                {action.user?.full_name || action.user?.email || `User #${action.user_id}`}
              </span>
            </span>

            <span className="flex items-center gap-1.5">
              <span className="text-base">🕒</span> 
              {dayjs(action.created_at).format("DD MMM YYYY, HH:mm")}
            </span>

            <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md font-bold">
              +{poin} poin
            </span>
          </div>
        </div>

        {/* Prediction ID Badge */}
        {action.prediction_id && (
          <div className="shrink-0">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
              <span>🔍</span> Scan #{action.prediction_id.slice(0, 6)}...
            </span>
          </div>
        )}
      </div>

      {/* NOTES (Catatan Pengguna) */}
      {action.notes && (
        <div className="bg-amber-50/50 border border-amber-100 p-3.5 rounded-xl text-sm text-gray-700 flex gap-2 items-start">
          <span className="text-amber-500 mt-0.5">💬</span>
          <p className="italic font-medium">"{action.notes}"</p>
        </div>
      )}

      {/* IMAGE (Bukti Aksi) */}
      {proofUrl && !imageError && (
        <div className="relative group rounded-xl overflow-hidden bg-gray-100 border border-gray-200 max-h-80 w-full sm:w-fit">
          <img
            src={proofUrl}
            alt="Bukti aksi dari pengguna"
            onError={() => setImageError(true)}
            loading="lazy"
            className="object-cover max-h-80 w-full transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}

      {/* Tampilan jika gambar gagal diload */}
      {proofUrl && imageError && (
        <div className="flex items-center justify-center bg-gray-50 border border-dashed border-gray-200 rounded-xl max-h-40 p-6 text-gray-400 text-sm">
          <span>⚠️ Gambar bukti tidak dapat dimuat atau telah dihapus.</span>
        </div>
      )}

      {/* BUTTONS (Hanya tampil jika status pending) */}
      {action.status === "pending" && (
        <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-gray-100">
          <button
            onClick={onReject}
            disabled={isLoading}
            className="flex-1 py-2.5 px-4 bg-white border-2 border-red-100 text-red-600 font-bold rounded-xl hover:bg-red-50 hover:border-red-200 transition-colors focus:outline-none focus:ring-4 focus:ring-red-50 disabled:opacity-50"
          >
            {isLoading ? "Memproses..." : "✕ Tolak Aksi"}
          </button>

          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-2 py-2.5 px-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-sm hover:shadow-emerald-500/30 focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:opacity-50"
          >
            {isLoading ? "Memproses..." : "✓ Konfirmasi & Berikan Poin"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ActionCard;