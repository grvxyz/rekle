import { useEffect, useState } from "react";

import ChallengeHero from "../../components/challenge/ChallengeHero.jsx";
import ChallengeSummary from "../../components/challenge/ChallengeSummary.jsx";
import ChallengeCard from "../../components/challenge/ChallengeCard.jsx";
import LeaderboardCard from "../../components/challenge/LeaderboardCard.jsx";

import api from "../../lib/axios.js";

function ChallengePage() {

  const [user, setUser] =
    useState(null);

  const [challenges,
    setChallenges] =
    useState([]);

  const [loading,
    setLoading] =
    useState(true);

  useEffect(() => {

    const fetchData =
      async () => {

        try {

          // USER
          const {
            data: userData,
          } = await api.get(
            "/users/me"
          );

          setUser(userData);

          // CHALLENGES
          const {
            data: challengeData,
          } = await api.get(
            "/content?type=challenge"
          );

          setChallenges(
            challengeData
          );

        } catch (err) {

          console.error(
            "Challenge fetch error:",
            err
          );

        } finally {

          setLoading(false);

        }
      };

    fetchData();

  }, []);

  // LOADING
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">

        <p className="text-sm text-gray-400 animate-pulse">
          Memuat challenge...
        </p>

      </div>
    );
  }

  // SUMMARY
  const completedChallenges =
    challenges.filter(
      (challenge) =>
        challenge.completed
    ).length;

  const totalRewardPoints =
    challenges
      .filter(
        (challenge) =>
          challenge.completed
      )
      .reduce(
        (sum, challenge) =>
          sum +
          challenge.reward_points,
        0
      );

  // LEADERBOARD
  const leaderboard = [
    {
      id: 1,
      name: "EcoHero",
      points: 2450,
    },

    {
      id: 2,
      name: "GreenSaver",
      points: 2210,
    },

    {
      id: 3,
      name: "RecycleKing",
      points: 1980,
    },

    {
      id: 4,
      name:
        user?.full_name ||
        "You",

      points:
        user?.total_points || 0,
    },
  ].sort(
    (a, b) =>
      b.points - a.points
  );

  return (
    <div className="min-h-screen bg-gray-50 px-4 pt-6 pb-8">

      <div className="max-w-6xl mx-auto space-y-6">

        {/* HERO */}
        <ChallengeHero />

        {/* SUMMARY */}
        <ChallengeSummary
          stats={{
            active:
              challenges.length,

            completed:
              completedChallenges,

            points:
              totalRewardPoints,
          }}
        />

        {/* CONTENT */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* CHALLENGE LIST */}
          <div className="lg:col-span-2 space-y-4">

            {challenges.length >
            0 ? (

              challenges.map(
                (challenge) => (

                  <ChallengeCard
                    key={
                      challenge.id
                    }

                    challenge={{
                      ...challenge,

                      reward:
                        challenge.reward_points,

                      current:
                        challenge.current_progress,

                      target:
                        challenge.target,

                      type:
                        challenge.challenge_type,
                    }}
                  />

                )
              )

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

          {/* LEADERBOARD */}
          <div>

            <LeaderboardCard
              users={leaderboard}
            />

          </div>

        </div>

      </div>

    </div>
  );
}

export default ChallengePage;