import dayjs from "dayjs";
import "dayjs/locale/id";
import { useState, useEffect } from "react";
import { ACTION_TYPE_LABEL, STATUS_CONFIG } from "./constants";
import { buildImageUrl } from "@/lib/imageURL";

dayjs.locale("id");

function resolveUserDisplay(action) {
  if (action.user?.full_name) return action.user.full_name;
  if (action.user?.email) return action.user.email;
  if (action.user_id) return `User #${action.user_id}`;
  return "Pengguna";
}

// ─── Baris detail ─────────────────────────────────────────
const DetailRow = ({ icon, label, value, valueClass = "text-gray-800" }) => (
  <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
    <span className="text-base shrink-0 mt-0.5">{icon}</span>
    <div className="flex-1 flex justify-between gap-4 min-w-0">
      <span className="text-xs text-gray-400 font-semibold whitespace-nowrap">{label}</span>
      <span className={`text-sm font-semibold text-right ${valueClass}`}>{value}</span>
    </div>
  </div>
);

// ─── Modal Detail Aksi ────────────────────────────────────
const ActionDetailModal = ({ action, onClose, onConfirm, onReject }) => {
  const [imageExpanded, setImageExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Tutup dengan ESC
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!action) return null;

  const statusCfg = STATUS_CONFIG[action.status] || STATUS_CONFIG.pending;
  const proofUrl = buildImageUrl(action.proof_image_path);
  const userName = resolveUserDisplay(action);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-lg">
              🧾
            </div>
            <div>
              <h2 className="text-base font-extrabold text-gray-900 leading-tight">
                Detail Aksi #{action.id}
              </h2>
              <p className="text-xs text-gray-400 font-medium">
                {dayjs(action.created_at).format("dddd, DD MMMM YYYY · HH:mm")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">

          {/* Status banner */}
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold ${statusCfg.className}`}>
            <span>{action.status === "approved" ? "✅" : action.status === "rejected" ? "❌" : "⏳"}</span>
            Status: {statusCfg.label}
            {action.status === "approved" && action.points_earned > 0 && (
              <span className="ml-auto text-emerald-700 font-black">+{action.points_earned} poin</span>
            )}
          </div>

          {/* Info Pengguna */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-3">Pengguna</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-sm font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{userName}</p>
                {action.user?.email && (
                  <p className="text-xs text-gray-400">{action.user.email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Info Aksi */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2">Informasi Aksi</p>
            <DetailRow icon="♻️" label="Jenis Aksi" value={ACTION_TYPE_LABEL[action.action_type] || action.action_type} />
            <DetailRow icon="🛣️" label="Jalur"
              value={action.route === "mitra" ? "Via Mitra" : "Mandiri"}
              valueClass={action.route === "mitra" ? "text-blue-600" : "text-purple-600"}
            />
            {action.partner_name && (
              <DetailRow icon="🏢" label="Nama Mitra" value={action.partner_name} />
            )}
            {action.weight_gram && (
              <DetailRow icon="⚖️" label="Berat Sampah"
                value={`${action.weight_gram} gram (${(action.weight_gram / 1000).toFixed(2)} kg)`}
              />
            )}
            {action.balance_earned > 0 && (
              <DetailRow icon="💰" label="Saldo Diperoleh"
                value={`Rp ${action.balance_earned.toLocaleString("id-ID")}`}
                valueClass="text-emerald-600"
              />
            )}
            {action.notes && (
              <div className="mt-3 bg-amber-50 border border-amber-100 rounded-lg p-3 flex gap-2">
                <span>💬</span>
                <p className="text-xs text-gray-700 italic">"{action.notes}"</p>
              </div>
            )}
          </div>

          {/* Foto Bukti */}
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2">Foto Bukti</p>
            {proofUrl && !imgError ? (
              <>
                <div
                  className={`relative rounded-xl overflow-hidden bg-gray-100 border border-gray-200 cursor-zoom-in transition-all ${imageExpanded ? "max-h-[500px]" : "max-h-56"}`}
                  onClick={() => setImageExpanded(!imageExpanded)}
                >
                  <img
                    src={proofUrl}
                    alt="Bukti aksi"
                    onError={() => setImgError(true)}
                    className="w-full object-contain transition-all"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-full font-bold">
                    {imageExpanded ? "🔼 Perkecil" : "🔍 Perbesar"}
                  </div>
                </div>
                <a
                  href={proofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs text-blue-500 hover:underline font-medium"
                >
                  ↗ Buka di tab baru
                </a>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center gap-2">
                <span className="text-4xl">{proofUrl ? "⚠️" : "📷"}</span>
                <p className="text-sm text-gray-400 font-medium">
                  {proofUrl ? "Foto tidak dapat dimuat" : "Belum ada foto bukti yang diunggah"}
                </p>
                {proofUrl && (
                  <a href={proofUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-blue-500 underline">Coba buka URL langsung</a>
                )}
              </div>
            )}
          </div>

          {/* Info Penolakan */}
          {action.status === "rejected" && action.rejection_reason && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-[11px] font-black uppercase tracking-widest text-red-400 mb-1">Alasan Penolakan</p>
              <p className="text-sm text-red-700 font-medium">{action.rejection_reason}</p>
            </div>
          )}

          {/* Info Verifikasi */}
          {action.verified_at && (
            <div className="bg-gray-50 rounded-xl p-4">
              <DetailRow icon="✅" label="Diverifikasi pada"
                value={dayjs(action.verified_at).format("DD MMM YYYY, HH:mm")}
              />
            </div>
          )}
        </div>

        {/* Footer: Tombol aksi jika pending */}
        {action.status === "pending" && (
          <div className="shrink-0 p-5 border-t border-gray-100 flex gap-3 bg-gray-50/50">
            <button
              onClick={onReject}
              className="flex-1 py-2.5 bg-white border-2 border-red-100 text-red-600 text-sm font-bold rounded-xl hover:bg-red-50 transition-colors"
            >
              ✕ Tolak Aksi
            </button>
            <button
              onClick={onConfirm}
              className="flex-[2] py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
            >
              ✓ Konfirmasi & Beri Poin
            </button>
          </div>
        )}
      </div>

      {/* Lightbox gambar full */}
      {/* sudah inline di dalam modal, klik untuk expand */}
    </div>
  );
};

export default ActionDetailModal;