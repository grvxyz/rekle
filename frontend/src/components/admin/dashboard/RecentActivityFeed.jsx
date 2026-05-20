import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/id";
import { Clock, CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

dayjs.extend(relativeTime);
dayjs.locale("id");

const ACTION_LABEL = {
  kompos: "Kompos",
  bank_sampah: "Bank Sampah",
  daur_ulang: "Daur Ulang",
  eco_brick: "Eco Brick",
  reuse: "Reuse",
  khusus: "Penanganan Khusus",
};

const ROUTE_LABEL = {
  mandiri: "Mandiri",
  mitra: "Via Mitra",
};

const StatusBadge = ({ status }) => {
  if (status === "pending")
    return (
      <span className="flex items-center gap-1 text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium">
        <Clock size={11} /> Menunggu
      </span>
    );
  if (status === "approved")
    return (
      <span className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
        <CheckCircle2 size={11} /> Disetujui
      </span>
    );
  return (
    <span className="flex items-center gap-1 text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium">
      <XCircle size={11} /> Ditolak
    </span>
  );
};

const RecentActivityFeed = ({ actions = [], loading = false }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-800">Aktivitas Terbaru</h2>
          <p className="text-xs text-gray-400 mt-0.5">Aksi yang baru diajukan pengguna</p>
        </div>
        <button
          onClick={() => navigate("/admin/konfirmasi")}
          className="flex items-center gap-1 text-xs text-green-700 font-medium hover:underline"
        >
          Lihat semua <ArrowRight size={13} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10 text-gray-400">
          <Loader2 size={20} className="animate-spin mr-2" /> Memuat...
        </div>
      ) : actions.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-sm">
          Belum ada aktivitas
        </div>
      ) : (
        <ul className="divide-y divide-gray-50">
          {actions.map((action) => (
            <li key={action.id} className="py-3 flex items-center gap-3">
              {/* Avatar / Initials */}
              <div className="w-9 h-9 rounded-xl bg-green-100 text-green-700 font-bold text-sm flex items-center justify-center shrink-0 uppercase">
                {(action.user?.full_name ?? action.user?.email ?? "?")[0]}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-800 truncate">
                    {action.user?.full_name ?? action.user?.email ?? `User #${action.user_id}`}
                  </span>
                  <StatusBadge status={action.status} />
                </div>
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  {ACTION_LABEL[action.action_type] ?? action.action_type}
                  {action.route ? ` · ${ROUTE_LABEL[action.route] ?? action.route}` : ""}
                  {action.partner_name ? ` · ${action.partner_name}` : ""}
                </p>
              </div>

              <div className="text-right shrink-0">
                <p className="text-xs text-gray-400">
                  {dayjs(action.created_at).fromNow()}
                </p>
                {action.points_earned > 0 && (
                  <p className="text-xs font-semibold text-green-600 mt-0.5">
                    +{action.points_earned} poin
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecentActivityFeed;