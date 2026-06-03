import dayjs from "dayjs";
import "dayjs/locale/id";
import { useState } from "react";
import { ACTION_TYPE_LABEL, STATUS_CONFIG } from "./constants";
import { buildImageUrl } from "@/lib/imageURL";

dayjs.locale("id");

// ─── Helper: resolusi nama user ─────────────────────────────
function resolveUserDisplay(action) {
  // Prioritas: objek user embed → fallback ke user_id
  if (action.user?.full_name) return action.user.full_name;
  if (action.user?.email) return action.user.email;
  if (action.user_id) return `User #${action.user_id}`;
  return "Pengguna";
}

function resolveAvatar(action) {
  if (action.user?.avatar_url) return buildImageUrl(action.user.avatar_url);
  return null;
}

// ─── Avatar kecil ───────────────────────────────────────────
const UserAvatar = ({ action }) => {
  const avatarUrl = resolveAvatar(action);
  const name = resolveUserDisplay(action);
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className="w-7 h-7 rounded-full object-cover ring-2 ring-white"
        onError={(e) => { e.target.style.display = "none"; }}
      />
    );
  }

  return (
    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-[10px] font-bold ring-2 ring-white">
      {initials || "U"}
    </div>
  );
};

// ─── Komponen Baris Info ─────────────────────────────────────
const InfoRow = ({ icon, label, value, highlight }) => (
  <div className="flex items-start gap-3">
    <span className="text-base mt-0.5 shrink-0">{icon}</span>
    <div className="flex flex-col min-w-0">
      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
      <span className={`text-sm font-semibold mt-0.5 ${highlight || "text-gray-800"}`}>
        {value ?? <span className="text-gray-400 font-normal italic">—</span>}
      </span>
    </div>
  </div>
);

// ─── Proof Image dengan fallback ─────────────────────────────
const ProofImage = ({ path, onExpand }) => {
  const [error, setError] = useState(false);
  const url = buildImageUrl(path);

  if (!url) return (
    <div className="flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-6 text-center gap-2">
      <span className="text-3xl">📷</span>
      <p className="text-xs text-gray-400 font-medium">Belum ada foto bukti</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center bg-red-50 border border-dashed border-red-200 rounded-xl p-6 text-center gap-2">
      <span className="text-3xl">⚠️</span>
      <p className="text-xs text-red-400 font-medium">Foto tidak dapat dimuat</p>
      <a href={url} target="_blank" rel="noopener noreferrer"
        className="text-xs text-blue-500 underline">Buka URL langsung</a>
    </div>
  );

  return (
    <div
      className="relative group rounded-xl overflow-hidden bg-gray-100 border border-gray-200 cursor-zoom-in"
      onClick={onExpand}
    >
      <img
        src={url}
        alt="Bukti aksi"
        onError={() => setError(true)}
        loading="lazy"
        className="w-full max-h-52 object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
        <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-bold bg-black/50 px-3 py-1.5 rounded-full transition-opacity">
          🔍 Perbesar
        </span>
      </div>
    </div>
  );
};

// ─── ActionCard Utama ────────────────────────────────────────
const ActionCard = ({ action, onConfirm, onReject, onViewDetail, isLoading }) => {
  const statusCfg = STATUS_CONFIG[action.status] || STATUS_CONFIG.pending;
  const poin = action.points_earned ?? 0;
  const userName = resolveUserDisplay(action);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5">
      {/* TOP STRIPE berdasarkan status */}
      <div className={`h-1 w-full ${
        action.status === "pending" ? "bg-amber-400" :
        action.status === "approved" ? "bg-emerald-500" : "bg-red-400"
      }`} />

      <div className="p-5 space-y-4">
        {/* HEADER ROW */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <UserAvatar action={action} />
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 leading-tight truncate">{userName}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {dayjs(action.created_at).format("DD MMM YYYY, HH:mm")}
              </p>
            </div>
          </div>
          <span className={`shrink-0 px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${statusCfg.className}`}>
            {statusCfg.label}
          </span>
        </div>

        {/* TIPE & ROUTE */}
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg">
            {ACTION_TYPE_LABEL[action.action_type] || action.action_type}
          </span>
          <span className={`px-3 py-1.5 text-xs font-bold rounded-lg ${
            action.route === "mitra"
              ? "bg-blue-100 text-blue-700"
              : "bg-purple-100 text-purple-700"
          }`}>
            {action.route === "mitra" ? "🤝 Via Mitra" : "🔧 Mandiri"}
          </span>
          {action.partner_name && (
            <span className="px-3 py-1.5 bg-teal-50 text-teal-700 text-xs font-semibold rounded-lg border border-teal-100">
              📍 {action.partner_name}
            </span>
          )}
        </div>

        {/* FOTO BUKTI */}
        <div>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Foto Bukti
          </p>
          <ProofImage
            path={action.proof_image_path}
            onExpand={() => onViewDetail && onViewDetail(action)}
          />
        </div>

        {/* CATATAN */}
        {action.notes && (
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex gap-2 items-start">
            <span className="text-amber-500 shrink-0">💬</span>
            <p className="text-xs text-gray-700 font-medium italic">"{action.notes}"</p>
          </div>
        )}

        {/* ACTION BUTTONS */}
        {action.status === "pending" && (
          <div className="flex gap-2.5 pt-2 border-t border-gray-100">
            <button
              onClick={() => onViewDetail && onViewDetail(action)}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors"
            >
              🔍 Detail
            </button>
            <button
              onClick={onReject}
              disabled={isLoading}
              className="flex-1 py-2.5 px-4 bg-white border-2 border-red-100 text-red-600 text-xs font-bold rounded-xl hover:bg-red-50 hover:border-red-200 transition-colors"
            >
              ✕ Tolak
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-[2] py-2.5 px-4 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-sm"
            >
              ✓ Setujui & Beri Poin
            </button>
          </div>
        )}

        {/* Jika sudah diverifikasi — info saja */}
        {action.status !== "pending" && (
          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <button
              onClick={() => onViewDetail && onViewDetail(action)}
              className="text-xs text-slate-500 font-semibold hover:text-slate-700 flex items-center gap-1"
            >
              🔍 Lihat Detail
            </button>
            {action.status === "approved" && (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                +{poin} poin diberikan
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionCard;