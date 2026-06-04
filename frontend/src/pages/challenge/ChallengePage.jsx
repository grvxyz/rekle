import { useEffect, useRef, useState } from "react";

import ChallengeHero    from "../../components/challenge/ChallengeHero.jsx";
import ChallengeSummary from "../../components/challenge/ChallengeSummary.jsx";
import ChallengeCard    from "../../components/challenge/ChallengeCard.jsx";
import LeaderboardCard  from "../../components/challenge/LeaderboardCard.jsx";
import { calculateChallengeProgress } from "@/utils/challengeProgress";
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Data user sendiri
        const { data: userData } = await api.get("/users/me");
        setUser(userData);

        // 2. Challenges aktif
        const response = await api.get("/content/?type=challenge&status=active");
        const challengeData = Array.isArray(response.data)
          ? response.data
          : response.data?.items ?? response.data?.data ?? [];

        // 3. Activity untuk progress
        const { data: rawActivity } = await api.get("/actions/activity?limit=200");
        const activityData = Array.isArray(rawActivity)
          ? rawActivity
          : rawActivity?.items ?? [];

        // 4. Enrich challenge dengan progress
        const enrichedChallenges = challengeData.map((challenge) => {
          const current = calculateChallengeProgress(activityData, challenge);
          const target  = challenge.target ?? 1;
          return { ...challenge, current, completed: current >= target };
        });
        setChallenges(enrichedChallenges);

        // 5. Leaderboard dari endpoint user biasa
        const { data: leaderboardRaw } = await api.get("/users/leaderboard?limit=10");
        const leaderboardData = Array.isArray(leaderboardRaw)
          ? leaderboardRaw.map((u) => ({
              id:     u.id,
              name:   u.full_name ?? `Pengguna`,
              city:   u.city ?? null,
              points: u.total_points ?? 0,
            }))
          : [];
        setLeaderboard(leaderboardData);

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

        anime({
          targets: heroRef.current,
          opacity: [0, 1], translateY: [-24, 0],
          duration: 600, easing: "easeOutCubic",
        });
        anime({
          targets: summaryRef.current,
          opacity: [0, 1], translateY: [16, 0],
          duration: 500, delay: 150, easing: "easeOutCubic",
        });

        const cardEls = listRef.current?.querySelectorAll(":scope > *") ?? [];
        anime({
          targets: cardEls,
          opacity: [0, 1], translateY: [20, 0],
          duration: 400,
          delay: anime.stagger
            ? anime.stagger(80, { start: 250 })
            : (_el, i) => 250 + i * 80,
          easing: "easeOutCubic",
        });

        anime({
          targets: boardRef.current,
          opacity: [0, 1], translateX: [32, 0],
          duration: 500, delay: 300, easing: "easeOutCubic",
        });

      } catch {
        [heroRef, summaryRef, boardRef].forEach((r) => {
          if (r.current) r.current.style.opacity = "1";
        });
        listRef.current?.querySelectorAll(":scope > *").forEach((el) => {
          el.style.opacity = "1";
        });
      }
    })();
  }, [loading]);

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
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
                <h3 className="text-lg font-semibold text-gray-800">
                  Belum Ada Challenge
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Admin belum menambahkan challenge aktif saat ini.
                </p>
              </div>
            )}
          </div>

          {/* Leaderboard */}
          <div ref={boardRef} style={{ opacity: 0 }}>
            <LeaderboardCard
              users={leaderboard}
              currentUserId={user?.id ?? null}
            />
          </div>
        </div>

      </div>
    </div>
  );
}