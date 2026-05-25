import { useEffect, useState } from "react";
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

  const navigate = useNavigate();

  useEffect(() => {

    const token =
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
      try {

        // USER
        const {
          data: userData,
        } = await api.get(
          "/users/me"
        );

        setUser(userData);

        // HISTORY
        try {

          const {
            data: historyData,
          } = await api.get(
            "/scan/history"
          );

          const items =
            historyData.items || [];

          setHistory(items);

          processInsight(items);

        } catch (err) {

          console.warn(
            "History API gagal",
            err
          );

          setHistory([]);
          processInsight([]);

        }

          // CHALLENGES
          try {

            const {
              data: challengeData,
            } = await api.get(
              "/content?type=challenge"
            );

            setChallenges(challengeData);

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

    if (!items.length) {
      setFavoriteCategory("-");
      return;
    }

    const categoryCount = {};

    items.forEach((item) => {

      categoryCount[item.result] =
        (
          categoryCount[
            item.result
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

          {/* AI INSIGHT */}
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

      </div>

    </div>
  );
}

export default Dashboard;