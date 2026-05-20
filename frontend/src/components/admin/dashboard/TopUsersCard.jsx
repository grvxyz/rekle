import { Trophy, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MEDAL = ["🥇", "🥈", "🥉"];

const TopUsersCard = ({ users = [], loading = false }) => {
  const navigate = useNavigate();

  // Sort by total_points desc, take top 5
  const sorted = [...users]
    .sort((a, b) => (b.total_points ?? 0) - (a.total_points ?? 0))
    .slice(0, 5);

  const maxPts = sorted[0]?.total_points || 1;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="bg-amber-100 text-amber-600 w-8 h-8 rounded-xl flex items-center justify-center">
            <Trophy size={16} />
          </span>
          <div>
            <h2 className="text-base font-semibold text-gray-800">Top Pengguna</h2>
            <p className="text-xs text-gray-400">Berdasarkan total poin</p>
          </div>
        </div>
        <button
          onClick={() => navigate("/admin/user")}
          className="flex items-center gap-1 text-xs text-green-700 font-medium hover:underline"
        >
          Semua user <ArrowRight size={13} />
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <p className="text-center py-8 text-gray-400 text-sm">Belum ada data pengguna</p>
      ) : (
        <ul className="space-y-2">
          {sorted.map((user, i) => (
            <li key={user.id} className="flex items-center gap-3">
              <span className="text-lg w-7 text-center">{MEDAL[i] ?? `#${i + 1}`}</span>

              <div className="w-8 h-8 rounded-lg bg-green-100 text-green-700 text-sm font-bold flex items-center justify-center uppercase shrink-0">
                {(user.full_name ?? user.email ?? "?")[0]}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-800 truncate">
                    {user.full_name ?? user.email}
                  </span>
                  <span className="text-xs font-semibold text-green-700 ml-2 shrink-0">
                    {(user.total_points ?? 0).toLocaleString("id-ID")} pts
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-700"
                    style={{ width: `${((user.total_points ?? 0) / maxPts) * 100}%` }}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TopUsersCard;