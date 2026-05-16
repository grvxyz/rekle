import { useEffect, useState } from "react";
import { Trophy, Medal } from "lucide-react";
import api from "@/lib/axios";

// ======================================================
// LEADERBOARD PAGE
// ======================================================

const LeaderboardPage = () => {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [myId, setMyId]       = useState(null); // highlight user sendiri

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError("");

        // Fetch leaderboard + profil sendiri secara paralel
        const [lbRes, meRes] = await Promise.all([
          api.get("/users/leaderboard"),
          api.get("/users/me"),
        ]);

        setUsers(Array.isArray(lbRes.data) ? lbRes.data : []);
        setMyId(meRes.data?.id ?? null);
      } catch (err) {
        console.error("[LeaderboardPage] Fetch error:", err);
        setError("Gagal mengambil data leaderboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <section className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto bg-yellow-100 rounded-full flex items-center justify-center">
            <Trophy className="w-8 h-8 text-yellow-500" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Leaderboard</h1>
          <p className="text-slate-500 text-sm">
            Ranking pengguna berdasarkan total poin
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-2xl text-sm text-center">
            {error}
          </div>
        )}

        {/* LIST */}
        {loading ? (
          <SkeletonLeaderboard />
        ) : users.length === 0 ? (
          <div className="bg-white rounded-2xl border p-10 text-center text-slate-400 text-sm">
            Belum ada data leaderboard
          </div>
        ) : (
          <div className="space-y-2">
            {users.map((user, index) => (
              <LeaderboardRow
                key={user.id}
                user={user}
                rank={index + 1}
                isMe={user.id === myId}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
};

// ======================================================
// LEADERBOARD ROW
// ======================================================

const RANK_CONFIG = {
  1: { icon: "🥇", bg: "bg-yellow-50 border-yellow-300",  text: "text-yellow-700" },
  2: { icon: "🥈", bg: "bg-slate-100 border-slate-300",   text: "text-slate-600" },
  3: { icon: "🥉", bg: "bg-orange-50 border-orange-300",  text: "text-orange-700" },
};

const LeaderboardRow = ({ user, rank, isMe }) => {
  const cfg = RANK_CONFIG[rank];

  return (
    <div
      className={`flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all ${
        isMe
          ? "bg-green-50 border-green-400 ring-1 ring-green-300"
          : cfg
          ? `${cfg.bg}`
          : "bg-white border-slate-200"
      }`}
    >
      {/* RANK */}
      <div className="w-8 text-center shrink-0">
        {cfg ? (
          <span className="text-xl">{cfg.icon}</span>
        ) : (
          <span className="text-sm font-bold text-slate-400">#{rank}</span>
        )}
      </div>

      {/* AVATAR */}
      <div className="w-10 h-10 rounded-full bg-green-800 text-white text-sm font-bold flex items-center justify-center shrink-0">
        {user.full_name
          ? user.full_name.trim().split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2)
          : "?"}
      </div>

      {/* INFO */}
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm truncate ${isMe ? "text-green-800" : "text-slate-800"}`}>
          {user.full_name || "Pengguna"}
          {isMe && (
            <span className="ml-2 text-xs font-normal text-green-600">(kamu)</span>
          )}
        </p>
        <p className="text-xs text-slate-400">
          {user.scan_count ?? 0} scan · {user.action_count ?? 0} aksi
        </p>
      </div>

      {/* POIN */}
      <div className="text-right shrink-0">
        <p className={`font-bold text-base ${cfg ? cfg.text : isMe ? "text-green-700" : "text-slate-700"}`}>
          {(user.total_points ?? 0).toLocaleString("id-ID")}
        </p>
        <p className="text-xs text-slate-400">poin</p>
      </div>
    </div>
  );
};

// ======================================================
// SKELETON
// ======================================================

const SkeletonLeaderboard = () => (
  <div className="space-y-2 animate-pulse">
    {[...Array(10)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 px-5 py-4 bg-white rounded-2xl border">
        <div className="w-8 h-5 bg-gray-200 rounded" />
        <div className="w-10 h-10 bg-gray-200 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <div className="h-4 bg-gray-200 rounded w-36" />
          <div className="h-3 bg-gray-200 rounded w-24" />
        </div>
        <div className="w-14 h-5 bg-gray-200 rounded" />
      </div>
    ))}
  </div>
);

export default LeaderboardPage;