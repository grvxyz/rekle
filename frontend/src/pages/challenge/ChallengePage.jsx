/**
 * ChallengePage.jsx
 *
 * Perubahan:
 * - Leaderboard: fallback ke GET /admin/users sorted by reward_points
 * - ChallengeCard: hanya tampil ringkas, navigasi ke /challenge/:id
 * - Animasi staggered via anime.js (sama seperti sebelumnya)
 */

import { useEffect, useRef, useState } from "react";

import ChallengeHero    from "../../components/challenge/ChallengeHero.jsx";
import ChallengeSummary from "../../components/challenge/ChallengeSummary.jsx";
import ChallengeCard    from "../../components/challenge/ChallengeCard.jsx";
import LeaderboardCard  from "../../components/challenge/LeaderboardCard.jsx";

import api from "../../lib/axios.js";

async function getAnime() {
  const mod = await import("animejs");
  return mod.default ?? mod.animate ?? mod;
}

export default function ChallengePage() {
  const [user, setUser]               = useState(null);
  const [challenges, setChallenges]   = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading]         = useState(true);

  const heroRef    = useRef(null);
  const summaryRef = useRef(null);
  const listRef    = useRef(null);
  const boardRef   = useRef(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: userData } = await api.get("/users/me");
        setUser(userData);

        // Hanya ambil challenge yang active
        const { data: challengeData } = await api.get("/content?type=challenge&status=active");
        setChallenges(challengeData);

        // ── Leaderboard: coba beberapa endpoint ──
        let topUsers = [];

        // Coba 1: /admin/analytics/insights (jika ada top_users)
        try {
          const { data: insights } = await api.get("/admin/analytics/insights");
          topUsers = insights?.top_users ?? insights?.data?.top_users ?? [];
        } catch { /* lanjut */ }

        // Coba 2: /admin/users — sort by reward_points di client
        if (!topUsers.length) {
          try {
            const { data: allUsers } = await api.get("/admin/users?limit=50");
            const users = Array.isArray(allUsers) ? allUsers : allUsers?.items ?? [];
            topUsers = users
              .filter((u) => (u.reward_points ?? u.total_points ?? 0) > 0)
              .sort((a, b) =>
                (b.reward_points ?? b.total_points ?? 0) -
                (a.reward_points ?? a.total_points ?? 0)
              )
              .slice(0, 10);
          } catch { /* lanjut */ }
        }

        // Normalize
        const normalized = topUsers.map((u, i) => ({
          id:     u.id ?? i,
          name:   u.full_name ?? u.username ?? u.name ?? u.email ?? `Pengguna ${i + 1}`,
          points: u.reward_points ?? u.total_points ?? u.points ?? u.score ?? 0,
          isMe:   u.id === userData?.id,
        }));

        // Pastikan user sendiri ada di list
        const alreadyIn = normalized.some((u) => u.isMe);
        if (!alreadyIn && userData) {
          normalized.push({
            id:     userData.id,
            name:   userData.full_name ?? userData.username ?? userData.email ?? "Kamu",
            points: userData.reward_points ?? userData.total_points ?? 0,
            isMe:   true,
          });
        }

        normalized.sort((a, b) => b.points - a.points);
        setLeaderboard(normalized.slice(0, 10));

      } catch (err) {
        console.error("Challenge fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ── Entrance animation ─────────────────────────────────────────────────────
  useEffect(() => {
    if (loading) return;
    (async () => {
      try {
        const anime = await getAnime();

        anime({ targets: heroRef.current, opacity: [0, 1], translateY: [-24, 0], duration: 600, easing: "easeOutCubic" });
        anime({ targets: summaryRef.current, opacity: [0, 1], translateY: [16, 0], duration: 500, delay: 150, easing: "easeOutCubic" });

        const cardEls = listRef.current?.querySelectorAll(":scope > *") ?? [];
        anime({
          targets: cardEls,
          opacity: [0, 1],
          translateY: [20, 0],
          duration: 400,
          delay: anime.stagger ? anime.stagger(80, { start: 250 }) : (_el, i) => 250 + i * 80,
          easing: "easeOutCubic",
        });

        anime({ targets: boardRef.current, opacity: [0, 1], translateX: [32, 0], duration: 500, delay: 300, easing: "easeOutCubic" });

      } catch {
        [heroRef, summaryRef, boardRef].forEach((r) => { if (r.current) r.current.style.opacity = "1"; });
        listRef.current?.querySelectorAll(":scope > *").forEach((el) => { el.style.opacity = "1"; });
      }
    })();
  }, [loading]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-sm text-gray-400 animate-pulse">Memuat challenge...</p>
    </div>
  );

  const completedChallenges = challenges.filter((c) => c.completed).length;
  const totalRewardPoints   = challenges
    .filter((c) => c.completed)
    .reduce((sum, c) => sum + (c.reward_points ?? 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 px-4 pt-6 pb-8">
      <div className="max-w-6xl mx-auto space-y-6">

        <div ref={heroRef} style={{ opacity: 0 }}>
          <ChallengeHero />
        </div>

        <div ref={summaryRef} style={{ opacity: 0 }}>
          <ChallengeSummary
            stats={{
              active:    challenges.length,
              completed: completedChallenges,
              points:    totalRewardPoints,
            }}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Challenge List */}
          <div ref={listRef} className="lg:col-span-2 space-y-4">
            {challenges.length > 0 ? (
              challenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                />
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
                <h3 className="text-lg font-semibold text-gray-800">Belum Ada Challenge</h3>
                <p className="mt-2 text-sm text-gray-500">Admin belum menambahkan challenge aktif saat ini.</p>
              </div>
            )}
          </div>

          {/* Leaderboard */}
          <div ref={boardRef} style={{ opacity: 0 }}>
            <LeaderboardCard users={leaderboard} />
          </div>

        </div>
      </div>
    </div>
  );
}