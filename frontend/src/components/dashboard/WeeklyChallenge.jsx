import {
  ArrowRight,
  Trophy,
  Target,
} from "lucide-react";

import { Card, CardContent } from "../ui/card.jsx";
import Button from "../ui/button.jsx";

function WeeklyChallenge({
  challenge,
  navigate,
}) {

  // TIDAK ADA CHALLENGE
  if (!challenge) {
    return (
      <Card className="border-0 shadow-sm bg-white">
        <CardContent className="p-6 text-center space-y-3">

          <Target className="w-10 h-10 text-gray-300 mx-auto" />

          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Belum Ada Challenge Aktif
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Admin belum menambahkan challenge baru.
            </p>
          </div>

        </CardContent>
      </Card>
    );
  }

  const progress =
    challenge.current_progress || 0;

  const target =
    challenge.target || 1;

  const progressPercent =
    Math.min(
      (progress / target) * 100,
      100
    );

  const completed =
    challenge.completed;

  return (
    <Card
      onClick={() =>
        navigate("/challenge")
      }
      className="overflow-hidden border-0 bg-gradient-to-br from-emerald-50 via-white to-green-50 shadow-sm cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
    >

      <CardContent className="p-6">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

          {/* LEFT */}
          <div className="space-y-5 flex-1">

            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-800">

              <Target className="w-4 h-4" />

              Active Challenge

            </div>

            {/* TITLE */}
            <div className="space-y-2">

              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900">

                {challenge.title}

              </h2>

              <p className="text-gray-600 leading-relaxed max-w-2xl">

                {challenge.description}

              </p>

            </div>

            {/* PROGRESS */}
            <div className="space-y-3">

              <div className="flex items-center justify-between text-sm">

                <span className="text-gray-600">

                  {progress}/{target} progress

                </span>

                <span className="font-semibold text-emerald-700">

                  {Math.round(
                    progressPercent
                  )}%

                </span>

              </div>

              <div className="h-3 w-full overflow-hidden rounded-full bg-emerald-100">

                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-green-500 transition-all duration-500"
                  style={{
                    width: `${progressPercent}%`,
                  }}
                />

              </div>

            </div>

            {/* FOOTER */}
            <div className="flex flex-wrap items-center gap-4 pt-2">

              <div className="flex items-center gap-2 text-amber-600">

                <Trophy className="w-5 h-5" />

                <span className="font-semibold">

                  +{challenge.reward_points || 0} Poin

                </span>

              </div>

              <Button
                className="rounded-xl"
                onClick={(e) => {
                  e.stopPropagation();

                  navigate("/challenge");
                }}
              >

                {completed
                  ? "Lihat Challenge"
                  : "Lanjutkan Challenge"}

                <ArrowRight className="w-4 h-4 ml-2" />

              </Button>

            </div>

          </div>

          {/* RIGHT */}
          <div className="hidden lg:flex items-center justify-center">

            <div className="relative">

              <div className="absolute inset-0 rounded-full bg-emerald-200 blur-3xl opacity-30" />

              <div className="relative w-44 h-44 rounded-full border-8 border-emerald-100 bg-white flex items-center justify-center shadow-inner">

                <div className="text-center">

                  <h2 className="text-5xl font-black text-emerald-700">

                    {progress}

                  </h2>

                  <p className="mt-1 text-sm text-gray-500">

                    dari {target}

                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </CardContent>

    </Card>
  );
}

export default WeeklyChallenge;