import { useState, useEffect } from "react";
import { Card, CardContent } from "../ui/card.jsx";
import SectionHeader from "../ui/SectionHeader.jsx";
import { Trophy, AlertCircle, RefreshCw } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

function getAccessToken() {
  return localStorage.getItem("access_token") ?? "";
}

async function fetchLeaderboard(limit = 10) {
  const res = await fetch(
    `${BASE_URL}/users/leaderboard?limit=${limit}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAccessToken()}`,
      },
    }
  );

  if (!res.ok) throw new Error("Gagal memuat leaderboard");

  const data = await res.json();
  return data.map((u, i) => ({
    id:     u.id ?? i,
    name:   u.full_name ?? `Pengguna ${i + 1}`,
    city:   u.city ?? null,
    avatar: u.avatar_url ?? null,
    points: u.total_points ?? 0,
  }));
}

// ─── Medal colours ────────────────────────────────────────────────────────────
const MEDAL = {
  0: { bg: "bg-amber-50",  text: "text-amber-600",  ring: "ring-amber-300"  },
  1: { bg: "bg-slate-100", text: "text-slate-500",  ring: "ring-slate-300"  },
  2: { bg: "bg-orange-50", text: "text-orange-500", ring: "ring-orange-300" },
};

function rankStyle(index) {
  return (
    MEDAL[index] ?? {
      bg:   "bg-emerald-50",
      text: "text-emerald-700",
      ring: "ring-emerald-200",
    }
  );
}

// ───Sub-components ─────────────────────────────────────────────────────────── 

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

// ───Main Component ───────────────────────────────────────────────────────────

function LeaderboardCard({
  users: usersProp = [],
  currentUserId = null,
  limit = 10,
  title = "Leaderboard",
  subtitle = "Top pengguna berdasarkan poin",
}) {
  const [users, setUsers]     = useState(usersProp);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const shouldFetch = !usersProp || usersProp.length === 0;

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLeaderboard(limit);
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (shouldFetch) load();
  }, []);

  useEffect(() => {
    if (!shouldFetch) setUsers(usersProp);
  }, [usersProp, shouldFetch]);

  return (
    <Card>
      <CardContent className="p-5">
        <SectionHeader title={title} subtitle={subtitle} />

        <div className="mt-4 space-y-3">
          {/* Loading skeleton */}
          {loading &&
            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

          {/* Error state */}
          {!loading && error && (
            <ErrorState message={error} onRetry={load} />
          )}

          {/* Empty state */}
          {!loading && !error && users.length === 0 && <EmptyState />}

          {/* Data rows */}
          {!loading && !error && users.map((user, index) => {
            const style = rankStyle(index);
            const isMe  = currentUserId && user.id === currentUserId;

            return (
              <div
                key={user.id}
                className={`flex items-center justify-between rounded-lg px-2 py-1 transition-colors ${
                  isMe ? "bg-emerald-50 ring-1 ring-emerald-200" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Rank badge */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ring-1 ${style.bg} ${style.text} ${style.ring}`}
                  >
                    {index + 1}
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      {user.name}
                      {isMe && (
                        <span className="text-xs text-emerald-500 font-normal">
                          (Kamu)
                        </span>
                      )}
                    </p>
                    {user.city && (
                      <p className="text-xs text-gray-400">{user.city}</p>
                    )}
                  </div>
                </div>

                {/* Points */}
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