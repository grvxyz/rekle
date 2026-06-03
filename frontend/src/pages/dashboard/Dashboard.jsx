/**
 * Dashboard.jsx
 *
 * FIX vs backend:
 * 1. UserResponse: total_points ✓, scan_count ✓, action_count ✓ — field sudah ada
 *    Tidak ada `reward_points` di UserResponse → ganti ke `total_points` di leaderboard
 * 2. GET /actions/activity — response mungkin array atau object { items }
 *    Tambah normalise guard
 * 3. Challenge progress logic di Dashboard masih pakai string matching (title/description)
 *    → diganti pakai calculateChallengeProgress yang sama dengan ChallengePage
 *    untuk konsistensi, sesuai ContentBase (challenge_type: scan|action|points)
 * 4. WeeklyChallenge: current_progress → current (konsisten dengan ChallengeCard)
 * 5. ContentResponse: reward_points (nullable, default 0) → tambah ?? 0 guard
 * 6. Reward popup: points_earned dari ActionResponse ✓
 */

import { useEffect, useState } from "react";
import { Trophy, Sparkles }    from "lucide-react";
import { useNavigate }         from "react-router-dom";

import HeroSection     from "../../components/dashboard/HeroSection.jsx";
import SummaryCards    from "../../components/dashboard/SummaryCards.jsx";
import InsightCard     from "../../components/dashboard/InsightCard.jsx";
import ActivityChart   from "../../components/dashboard/ActivityChart.jsx";
import RecentHistory   from "../../components/dashboard/RecentHistory.jsx";
import WeeklyChallenge from "../../components/dashboard/WeeklyChallenge.jsx";
import { calculateChallengeProgress } from "@/utils/challengeProgress";

import api from "../../lib/axios.js";

function Dashboard() {
  const [user, setUser]                   = useState(null);
  const [history, setHistory]             = useState([]);
  const [challenges, setChallenges]       = useState([]);
  const [favoriteCategory, setFavoriteCategory] = useState("-");
  const [rewardPopup, setRewardPopup]     = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const token =
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("access_token");

    // FIX: is_superuser dari UserResponse (boolean)
    const isSuperuser = sessionStorage.getItem("is_superuser") === "true";

    if (!token) { navigate("/login"); return; }
    if (isSuperuser) { navigate("/admin/dashboard", { replace: true }); return; }

    const fetchAll = async () => {
      let historyData = [];

      try {
        // GET /api/v1/users/me → UserResponse
        const { data: userData } = await api.get("/users/me");
        setUser(userData);

        // GET /api/v1/actions/activity
        try {
          const response = await api.get("/actions/activity");

          // FIX: normalise response — bisa array atau { items }
          historyData = Array.isArray(response.data)
            ? response.data
            : response.data?.items ?? [];

          setHistory(historyData);

          // Reward popup detector — cek action yang baru approved
          // ActionResponse: { id, type, status, points_earned, ... }
          const approvedAction = historyData.find(
            (item) =>
              item.type === "action" &&
              item.status === "approved" &&
              item.points_earned > 0
          );

          if (approvedAction) {
            const popupKey    = `reward_popup_${approvedAction.id}`;
            const alreadyShown = sessionStorage.getItem(popupKey);
            if (!alreadyShown) {
              setRewardPopup({ points: approvedAction.points_earned });
              sessionStorage.setItem(popupKey, "shown");
              setTimeout(() => setRewardPopup(null), 4500);
            }
          }

          processInsight(historyData);

        } catch (err) {
          console.warn("Activity API gagal", err);
          setHistory([]);
          processInsight([]);
        }

        // GET /api/v1/content/?type=challenge → ContentResponse[]
        try {
          const response = await api.get("/content?type=challenge");

          // FIX: normalise
          const challengeData = Array.isArray(response.data)
            ? response.data
            : response.data?.items ?? response.data?.data ?? [];

          // FIX: pakai calculateChallengeProgress yang sama dengan ChallengePage
          // untuk konsistensi — bukan string-matching ad hoc
          const enrichedChallenges = challengeData.map((challenge) => {
            const current = calculateChallengeProgress(historyData, challenge);
            const target  = challenge.target ?? 1;
            return {
              ...challenge,
              // FIX: gunakan `current` (konsisten dengan ChallengeCard & ChallengeDetail)
              current,
              completed: current >= target,
            };
          });

          setChallenges(enrichedChallenges);

        } catch (err) {
          console.warn("Challenge API gagal", err);
          setChallenges([]);
        }

      } catch (err) {
        console.error(err);
        navigate("/login");
      }
    };

    fetchAll();
  }, [navigate]);

  // Insight: kategori favorit dari scan history
  const processInsight = (items = []) => {
    const scanItems = items.filter((item) => item.type === "scan");
    if (!scanItems.length) { setFavoriteCategory("-"); return; }

    const categoryCount = {};
    scanItems.forEach((item) => {
      const result = item.title || "Lainnya";
      categoryCount[result] = (categoryCount[result] || 0) + 1;
    });

    let max = 0, fav = "-";
    for (const key in categoryCount) {
      if (categoryCount[key] > max) { max = categoryCount[key]; fav = key; }
    }
    setFavoriteCategory(fav);
  };

  // Chart data — group by tanggal
  const chartData = history.reduce((acc, item) => {
    const date = new Date(item.created_at).toLocaleDateString("id-ID", {
      day: "numeric", month: "short",
    });
    const existing = acc.find((e) => e.date === date);
    if (existing) existing.total += 1;
    else acc.push({ date, total: 1 });
    return acc;
  }, []);

  // Challenge aktif — belum selesai, sort by progress tertinggi
  const activeChallenges = challenges.filter((c) => !c.completed);
  const sortedChallenges = [...activeChallenges].sort((a, b) => {
    const pA = (a.current ?? 0) / (a.target ?? 1);
    const pB = (b.current ?? 0) / (b.target ?? 1);
    return pB - pA;
  });

  const currentChallenge = sortedChallenges[0] ?? challenges[0] ?? null;
  const allCompleted     = challenges.length > 0 && challenges.every((c) => c.completed);

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-sm text-gray-400 animate-pulse">Memuat dashboard...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 px-4 pt-6 pb-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* HERO — UserResponse: full_name, total_points, scan_count, action_count */}
        <HeroSection
          user={user}
          navigate={navigate}
          weeklyActivity={history.length}
        />

        {/* SUMMARY — UserResponse fields */}
        <SummaryCards
          user={user}
          favoriteCategory={favoriteCategory}
        />

        {/* GAMIFICATION INFO */}
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-3xl p-6 text-white shadow-sm">
          <h2 className="text-xl font-bold">Cara Mendapatkan Poin</h2>
          <p className="text-sm text-emerald-50 mt-1">
            Semakin aktif mengelola sampah, semakin banyak poin & reward yang kamu dapatkan.
          </p>
          <div className="grid md:grid-cols-3 gap-4 mt-5">
            <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <p className="text-sm text-emerald-100">Scan Sampah</p>
              <h3 className="text-2xl font-bold mt-1">+10 Poin</h3>
            </div>
            <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <p className="text-sm text-emerald-100">Action Diverifikasi</p>
              <h3 className="text-2xl font-bold mt-1">+50 Poin</h3>
            </div>
            <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <p className="text-sm text-emerald-100">Challenge Selesai</p>
              <h3 className="text-2xl font-bold mt-1">+200 Poin</h3>
            </div>
          </div>
        </div>

        {/* WEEKLY CHALLENGE
            FIX: mapping field ke WeeklyChallenge menggunakan `current` bukan `current_progress`
            FIX: reward dari `reward_points` (ContentResponse) bukan `reward`
        */}
        <WeeklyChallenge
          challenge={
            currentChallenge
              ? {
                  ...currentChallenge,
                  reward:  currentChallenge.reward_points ?? 0, // ContentResponse.reward_points
                  current: currentChallenge.current ?? 0,       // FIX: was current_progress
                  type:    currentChallenge.challenge_type,     // ContentResponse.challenge_type
                }
              : null
          }
          allCompleted={allCompleted}
          navigate={navigate}
        />

        {/* CHART + INSIGHT */}
        <div className="grid lg:grid-cols-3 gap-6 items-stretch">
          <div className="lg:col-span-2">
            <ActivityChart data={chartData} />
          </div>
          <div>
            <InsightCard history={history} />
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <RecentHistory history={history} />

        {/* REWARD POPUP — muncul jika ada ActionResponse.status="approved" yang baru */}
        {rewardPopup && (
          <div className="fixed top-6 right-6 z-[100] animate-in slide-in-from-top duration-500">
            <div className="bg-white border border-emerald-100 shadow-xl rounded-3xl p-5 w-[320px]">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">
                  <Trophy className="w-7 h-7 text-emerald-600" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900">Reward Ditambahkan</h3>
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Action berhasil diverifikasi admin.
                  </p>
                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1 text-2xl font-bold text-emerald-600">
                      +{rewardPopup.points}
                      <span className="text-base font-semibold">poin</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Dashboard;