import {
  Trophy,
  Target,
  Sparkles,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

function WeeklyChallenge({
  challenge,
  allCompleted = false,
  navigate,
}) {

  // EMPTY STATE
  if (!challenge) {

    return (
      <section className="bg-white rounded-3xl border shadow-sm p-10 text-center">

        <div className="w-20 h-20 mx-auto rounded-full bg-slate-100 flex items-center justify-center">
          <Target className="w-10 h-10 text-slate-300" />
        </div>

        <h2 className="mt-5 text-2xl font-bold text-slate-800">
          Belum Ada Challenge Aktif
        </h2>

        <p className="mt-2 text-slate-500 max-w-md mx-auto">
          Admin belum menambahkan challenge baru.
          Yuk mulai scan dan lakukan aksi ramah lingkungan sambil menunggu challenge berikutnya 🌱
        </p>

      </section>
    );
  }

  const current =
    challenge.current || 0;

  const target =
    challenge.target || 1;

  const progress =
    Math.min(
      (current / target) * 100,
      100
    );

  const completed =
    current >= target;

  const reward =
    challenge.reward || 200;

  const type =
    challenge.type || "challenge";

  return (
    <section
      className={`relative overflow-hidden rounded-3xl shadow-sm border p-8 transition-all ${
        completed
          ? "bg-gradient-to-br from-emerald-500 to-green-600 text-white border-emerald-400"
          : "bg-white"
      }`}
    >

      {/* Background decoration */}
      <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/10 blur-2xl" />

      <div className="relative z-10">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">

          <div className="space-y-4">

            {/* Badge */}
            <div className="flex items-center gap-2 flex-wrap">

              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                  completed
                    ? "bg-white/20 text-white"
                    : "bg-emerald-50 text-emerald-700"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />

                {type === "scan"
                  ? "Scan Challenge"
                  : "Eco Challenge"}
              </span>

              {completed && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-white text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Completed
                </span>
              )}

            </div>

            {/* Title */}
            <div>
              <h2
                className={`text-3xl font-bold ${
                  completed
                    ? "text-white"
                    : "text-slate-900"
                }`}
              >
                {challenge.title}
              </h2>

              <p
                className={`mt-2 text-sm leading-relaxed max-w-2xl ${
                  completed
                    ? "text-emerald-50"
                    : "text-slate-500"
                }`}
              >
                {challenge.description ||
                  "Selesaikan challenge untuk mendapatkan reward tambahan."}
              </p>
            </div>

            {/* Progress */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm font-medium">
                <span
                  className={
                    completed
                      ? "text-white"
                      : "text-slate-600"
                  }
                >
                  Progress Challenge
                </span>

                <span
                  className={
                    completed
                      ? "text-white"
                      : "text-slate-800"
                  }
                >
                  {current} / {target}
                </span>
              </div>

              <div
                className={`h-4 rounded-full overflow-hidden ${
                  completed
                    ? "bg-white/20"
                    : "bg-slate-100"
                }`}
              >
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    completed
                      ? "bg-white"
                      : "bg-gradient-to-r from-emerald-500 to-green-600"
                  }`}
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Reward Card */}
          <div
            className={`rounded-3xl p-6 min-w-[220px] border ${
              completed
                ? "bg-white/10 border-white/20"
                : "bg-amber-50 border-amber-100"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  completed
                    ? "bg-white/20"
                    : "bg-white"
                }`}
              >
                <Trophy
                  className={`w-7 h-7 ${
                    completed
                      ? "text-white"
                      : "text-amber-500"
                  }`}
                />
              </div>

              <div>
                <p
                  className={`text-sm ${
                    completed
                      ? "text-emerald-50"
                      : "text-slate-500"
                  }`}
                >
                  Reward
                </p>

                <h3
                  className={`text-3xl font-bold ${
                    completed
                      ? "text-white"
                      : "text-slate-900"
                  }`}
                >
                  +{reward}
                </h3>

                <p
                  className={`text-xs ${
                    completed
                      ? "text-emerald-100"
                      : "text-slate-400"
                  }`}
                >
                  Eco Points
                </p>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={() =>
                navigate("/challenge")
              }
              className={`mt-6 w-full py-3 rounded-2xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                completed
                  ? "bg-white text-emerald-700 hover:bg-emerald-50"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
            >
              {completed
                ? "Lihat Challenge"
                : "Lanjutkan Challenge"}

              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Footer message */}
        <div
          className={`mt-6 text-sm ${
            completed
              ? "text-emerald-50"
              : "text-slate-500"
          }`}
        >

          {completed ? (
            <p>
              🎉 Challenge berhasil diselesaikan!
              Reward akan ditambahkan setelah sistem melakukan sinkronisasi.
            </p>
          ) : (
            <p>
              Terus lakukan scan dan aksi pengelolaan sampah untuk menyelesaikan challenge ini lebih cepat 🚀
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default WeeklyChallenge;