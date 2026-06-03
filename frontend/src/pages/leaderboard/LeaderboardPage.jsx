import { useState, useEffect } from "react";
import { Card, CardContent } from "../ui/card.jsx";
import SectionHeader from "../ui/SectionHeader.jsx";
import { Trophy, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import api from "@/lib/axios";

/**
 * Fetch top users.
 *
 * - Jika user adalah admin  → GET /admin/analytics/insights (field top_users)
 * - Jika bukan admin / 403  → fallback ke GET /users/me, tampilkan data sendiri
 *
 * Tidak lagi hardcode fetch ke endpoint admin untuk semua user.
 */
async function fetchLeaderboard(limit = 10) {
  // Coba endpoint admin dulu
  try {
    const { data } = await api.get("/admin/analytics/insights");

    const raw =
      data?.top_users ??
      data?.leaderboard ??
      data?.data?.top_users ??
      data?.data?.leaderboard ??
      null;

    if (Array.isArray(raw) && raw.length > 0) {
      return raw.slice(0, limit).map((u, i) => ({
        id:     u.id ?? u.user_id ?? i,
        name:   u.name ?? u.full_name ?? u.username ?? u.email ?? `Pengguna ${i + 1}`,
        points: u.points ?? u.total_points ?? u.score ?? u.reward_points ?? 0,
      }));
    }
  } catch (err) {
    // 403 = bukan admin — lanjut ke fallback
    if (err.response?.status !== 403) {
      throw err;
    }
  }

  // Fallback: tampilkan data user sendiri
  const { data: me } = await api.get("/users/me");
  return [
    {
      id:     me.id,
      name:   (me.full_name ?? me.email ?? "Kamu") + " (Kamu)",
      points: me.total_points ?? 0,
    },
  ];
}

// ─── Medal colours ─────────────────────────────────────────
const MEDAL = {
  0: { bg: "bg-amber-50",  text: "text-amber-600",  ring: "ring-amber-300"  },
  1: { bg: "bg-slate-100", text: "text-slate-500",  ring: "ring-slate-300"  },
  2: { bg: "bg-orange-50", text: "text-orange-500", ring: "ring-orange-300" },
};

function rankStyle(index) {
  return MEDAL[index] ?? {
    bg:   "bg-emerald-50",
    text: "text-emerald-700",
    ring: "ring-emerald-200",
  };
}

// ─── Sub-components ────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-200" />
        <div className="h-3 w-32 rounded bg-gray-200" />
      </div>
      <div className="h-3 w-12 rounded bg-gray-200" />
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center gap-2 py-6 text-center">
      <AlertCircle className="w-5 h-5 text-red-400" />
      <p className="text-xs text-gray-500 max-w-[200px]">{message}</p>
      <button
        onClick={onRetry}
        className="mt-1 flex items-center gap-1 text-xs text-emerald-600 hover:underline"
      >
        <RefreshCw className="w-3 h-3" />
        Coba lagi
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-6 text-center">
      <p className="text-xs text-gray-400">Belum ada data leaderboard.</p>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────

/**
 * LeaderboardCard
 *
 * Props:
 *  - users    {Array}   – opsional; jika diisi, data statis ini digunakan
 *  - limit    {number}  – jumlah maks baris (default 10)
 *  - title    {string}  – judul card
 *  - subtitle {string}  – subjudul card
 */
function LeaderboardCard({
  users: usersProp = [],
  limit = 10,
  title = "Leaderboard",
  subtitle = "Top pengguna minggu ini",
}) {
  const [users,   setUsers]   = useState(usersProp);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const shouldFetch = !usersProp || usersProp.length === 0;

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLeaderboard(limit);
      setUsers(data);
    } catch (err) {
      setError("Gagal memuat data leaderboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (shouldFetch) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!shouldFetch) setUsers(usersProp);
  }, [usersProp, shouldFetch]);

  return (
    <Card>
      <CardContent className="p-5">
        <SectionHeader title={title} subtitle={subtitle} />

        <div className="mt-4 space-y-3">
          {loading && Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

          {!loading && error && (
            <ErrorState message={error} onRetry={load} />
          )}

          {!loading && !error && users.length === 0 && <EmptyState />}

          {!loading && !error && users.map((user, index) => {
            const style = rankStyle(index);
            return (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ring-1 ${style.bg} ${style.text} ${style.ring}`}
                  >
                    {index + 1}
                  </div>
                  <p className="text-sm font-medium text-gray-700">{user.name}</p>
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  <Trophy className="w-4 h-4" />
                  <span className="text-sm font-semibold">
                    {user.points.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default LeaderboardCard;