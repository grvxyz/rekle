import {
  useEffect,
  useState,
} from "react";
import {
  Trophy,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import HeroSection from "../../components/dashboard/HeroSection.jsx";
import SummaryCards from "../../components/dashboard/SummaryCards.jsx";
import InsightCard from "../../components/dashboard/InsightCard.jsx";
import ActivityChart from "../../components/dashboard/ActivityChart.jsx";
import RecentHistory from "../../components/dashboard/RecentHistory.jsx";
import WeeklyChallenge from "../../components/dashboard/WeeklyChallenge.jsx";

import api from "../../lib/axios.js";

function Dashboard() {

  const [user, setUser] = useState(null);

  const [history, setHistory] =
    useState([]);

  const [challenges, setChallenges] =
    useState([]);

  const [favoriteCategory,
    setFavoriteCategory] =
    useState("-");

  const [rewardPopup,
    setRewardPopup] =
    useState(null);

  const navigate = useNavigate();

  useEffect(() => {

    const token =
      localStorage.getItem(
        "access_token"
      ) ||
      sessionStorage.getItem(
        "access_token"
      );

    const isSuperuser =
      sessionStorage.getItem(
        "is_superuser"
      ) === "true";

    // NOT LOGIN
    if (!token) {
      navigate("/login");
      return;
    }

    // ADMIN
    if (isSuperuser) {

      navigate(
        "/admin/dashboard",
        {
          replace: true,
        }
      );

      return;
    }

    const fetchAll = async () => {

      let historyData = [];
      try {

        // USER
        const {
          data: userData,
        } = await api.get(
          "/users/me"
        );

        setUser(userData);

        // ACTIVITY HISTORY
        try {

        const response = await api.get(
          "/actions/activity"
        );

        historyData = response.data || [];

          setHistory(historyData);

          // ======================================
          // REWARD POPUP DETECTOR
          // ======================================

          const approvedAction =
            historyData.find(
              (item) =>
                item.type === "action" &&
                item.status === "approved" &&
                item.points_earned > 0
            );

          if (approvedAction) {

            const popupKey =
              `reward_popup_${approvedAction.id}`;

            const alreadyShown =
              sessionStorage.getItem(
                popupKey
              );

            if (!alreadyShown) {

              setRewardPopup({
                points:
                  approvedAction.points_earned,
              });

              sessionStorage.setItem(
                popupKey,
                "shown"
              );

              setTimeout(() => {
                setRewardPopup(null);
              }, 4500);

            }
          }

          processInsight(historyData);

        } catch (err) {

          console.warn(
            "Activity API gagal",
            err
          );

          setHistory([]);
          processInsight([]);

        }

        // CHALLENGES
        try {

        const response = await api.get(
          "/content?type=challenge"
        );

        const challengeData =
          Array.isArray(response.data)
            ? response.data
            : response.data.items ||
              response.data.data ||
              [];

          // ===== AUTO PROGRESS ENGINE =====
          const scanCount =
              historyData.filter(
                (item) =>
                  item.type === "scan"
              ).length;

            const actionCount =
              historyData.filter(
                (item) =>
                  item.type === "action"
              ).length;

          const enrichedChallenges =
            challengeData.map(
              (challenge) => {

                let current = 0;

                const title =
                  (
                    challenge.title || ""
                  ).toLowerCase();

                const description =
                  (
                    challenge.description || ""
                  ).toLowerCase();

                // SCAN CHALLENGE
                if (
                  title.includes("scan") ||
                  description.includes("scan")
                ) {

                  current = scanCount;

                }

                // ACTION CHALLENGE
                else if (
                  title.includes("aksi") ||
                  title.includes("action") ||
                  title.includes("reuse") ||
                  title.includes("kompos") ||
                  title.includes("daur ulang")
                ) {

                  current = actionCount;

                }

                const target =
                  challenge.target || 1;

                return {
                  ...challenge,
                  current_progress:
                    current,
                  completed:
                    current >= target,
                };
              }
            );

          setChallenges(
            enrichedChallenges
          );

        } catch (err) {

          console.warn(
            "Challenge API gagal",
            err
          );

          setChallenges([]);

        }

      } catch (err) {

        console.error(err);

        navigate("/login");

      }
    };

    fetchAll();

  }, [navigate]);

  // FAVORITE CATEGORY
  const processInsight = (
    items = []
  ) => {

    const scanItems =
      items.filter(
        (item) =>
          item.type === "scan"
      );

    if (!scanItems.length) {

      setFavoriteCategory("-");
      return;

    }

    const categoryCount = {};

    scanItems.forEach((item) => {

      const result =
        item.title || "Lainnya";

      categoryCount[result] =
        (
          categoryCount[
            result
          ] || 0
        ) + 1;

    });

    let max = 0;
    let fav = "-";

    for (let key in categoryCount) {

      if (
        categoryCount[key] > max
      ) {

        max =
          categoryCount[key];

        fav = key;

      }
    }

    setFavoriteCategory(fav);
  };

  // CHART DATA
  const chartData =
    history.reduce(
      (acc, item) => {

        const date =
          new Date(
            item.created_at
          ).toLocaleDateString(
            "id-ID",
            {
              day: "numeric",
              month: "short",
            }
          );

        const existing =
          acc.find(
            (entry) =>
              entry.date === date
          );

        if (existing) {

          existing.total += 1;

        } else {

          acc.push({
            date,
            total: 1,
          });

        }

        return acc;

      },
      []
    );

  // ACTIVE CHALLENGE
  const activeChallenges =
    challenges.filter(
      (challenge) =>
        !challenge.completed
    );

  // SORT BY PROGRESS
  const sortedChallenges =
    [...activeChallenges].sort(
      (a, b) => {

        const progressA =
          (a.current_progress || 0) /
          (a.target || 1);

        const progressB =
          (b.current_progress || 0) /
          (b.target || 1);

        return progressB - progressA;
      }
    );

  // CURRENT CHALLENGE
  const currentChallenge =
    sortedChallenges[0] ||
    challenges[0] ||
    null;

  // ALL COMPLETED
  const allCompleted =
    challenges.length > 0 &&
    challenges.every(
      (challenge) =>
        challenge.completed
    );

  // LOADING
  if (!user) {

    return (
      <div className="min-h-screen flex items-center justify-center">

        <p className="text-sm text-gray-400 animate-pulse">
          Memuat dashboard...
        </p>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 pt-6 pb-8">

      <div className="max-w-6xl mx-auto space-y-6">

        {/* HERO */}
        <HeroSection
          user={user}
          navigate={navigate}
          weeklyActivity={
            history.length
          }
        />

        {/* SUMMARY */}
        <SummaryCards
          user={user}
          favoriteCategory={
            favoriteCategory
          }
        />

        {/* GAMIFICATION INFO */}
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-3xl p-6 text-white shadow-sm">

          <h2 className="text-xl font-bold">
            Cara Mendapatkan Poin 
          </h2>

          <p className="text-sm text-emerald-50 mt-1">
            Semakin aktif mengelola sampah,
            semakin banyak poin & reward yang kamu dapatkan.
          </p>

          <div className="grid md:grid-cols-3 gap-4 mt-5">

            <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <p className="text-sm text-emerald-100">
                Scan Sampah
              </p>

              <h3 className="text-2xl font-bold mt-1">
                +10 Poin
              </h3>
            </div>

            <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <p className="text-sm text-emerald-100">
                Action Diverifikasi
              </p>

              <h3 className="text-2xl font-bold mt-1">
                +50 Poin
              </h3>
            </div>

            <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <p className="text-sm text-emerald-100">
                Challenge Selesai
              </p>

              <h3 className="text-2xl font-bold mt-1">
                +200 Poin
              </h3>
            </div>

          </div>

        </div>

        {/* WEEKLY CHALLENGE */}
        <WeeklyChallenge
          challenge={
            currentChallenge
              ? {
                  ...currentChallenge,

                  reward:
                    currentChallenge.reward_points,

                  current:
                    currentChallenge.current_progress,

                  type:
                    currentChallenge.challenge_type,
                }
              : null
          }

          allCompleted={
            allCompleted
          }

          navigate={navigate}
        />

        {/* CHART + INSIGHT */}
        <div className="grid lg:grid-cols-3 gap-6 items-stretch">

          {/* CHART */}
          <div className="lg:col-span-2">

            <ActivityChart
              data={chartData}
            />

          </div>

          {/* INSIGHT */}
          <div>

            <InsightCard
              history={history}
            />

          </div>

        </div>

        {/* RECENT ACTIVITY */}
        <RecentHistory
          history={history}
        />

{/* REWARD POPUP */}
{rewardPopup && (

  <div className="fixed top-6 right-6 z-[100] animate-in slide-in-from-top duration-500">

    <div className="bg-white border border-emerald-100 shadow-xl rounded-3xl p-5 w-[320px]">

      <div className="flex items-start gap-4">

        <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">

          <Trophy className="w-7 h-7 text-emerald-600" />

        </div>

        <div className="space-y-1 flex-1">

          <div className="flex items-center gap-2">

            <h3 className="font-bold text-slate-900">
              Reward Ditambahkan
            </h3>

            <Sparkles className="w-4 h-4 text-amber-500" />

          </div>

          <p className="text-sm text-slate-500 leading-relaxed">

            Action berhasil diverifikasi admin.

          </p>

          <div className="pt-1">

            <span className="inline-flex items-center gap-1 text-2xl font-bold text-emerald-600">

              +{
                rewardPopup.points
              }

              <span className="text-base font-semibold">
                poin
              </span>

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