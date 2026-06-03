import {
  Sparkles,
  ScanLine,
  Leaf,
} from "lucide-react";

import Button from "../ui/button.jsx";
import { Card, CardContent } from "../ui/card.jsx";

function HeroSection({
  user,
  navigate,
  weeklyActivity = 0,
}) {
  const firstName =
    user?.full_name?.split(" ")[0] || "User";

  const ecoLevel =
    user.total_points >= 1000
      ? "Eco Warrior"
      : user.total_points >= 500
      ? "Green Hero"
      : "Eco Starter";

  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-br from-emerald-900 via-green-800 to-emerald-700 text-white shadow-xl">

      <CardContent className="relative p-6 md:p-8">

        {/* Glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

          {/* LEFT */}
          <div className="max-w-2xl space-y-5">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>{ecoLevel}</span>
            </div>

            {/* Heading */}
            <div className="space-y-3">

              <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight">
                Halo, {firstName}! 
              </h1>

              <p className="text-emerald-50/85 text-base md:text-lg leading-relaxed max-w-xl">
                Setiap scan dan aksi yang kamu lakukan membantu
                menciptakan lingkungan yang lebih bersih dan
                berkelanjutan.
              </p>

            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-4 pt-2">

              <div className="rounded-2xl bg-white/10 backdrop-blur-sm px-5 py-4 min-w-[140px]">
                <p className="text-sm text-emerald-100/80">
                  Total Poin
                </p>

                <h3 className="mt-1 text-2xl font-bold">
                  {user.total_points}
                </h3>
              </div>

              <div className="rounded-2xl bg-white/10 backdrop-blur-sm px-5 py-4 min-w-[140px]">
                <p className="text-sm text-emerald-100/80">
                  Aktivitas Minggu Ini
                </p>

                <h3 className="mt-1 text-2xl font-bold">
                  {weeklyActivity}
                </h3>
              </div>

            </div>

            {/* CTA */}
            <div className="flex flex-wrap gap-3 pt-2">

              <Button
                onClick={() => navigate("/scan")}
                className="bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl px-5 py-3 flex items-center gap-2"
              >
                <ScanLine className="w-4 h-4" />
                Mulai Scan
              </Button>

            </div>

          </div>

          {/* RIGHT */}
          <div className="hidden lg:flex items-center justify-center">

            <div className="relative">

              <div className="absolute inset-0 bg-white/10 blur-3xl rounded-full" />

              <div className="relative w-52 h-52 rounded-full border border-white/10 bg-white/10 backdrop-blur-md flex items-center justify-center">

                <div className="text-center space-y-2">

                  <div className="w-20 h-20 rounded-full bg-white/10 mx-auto flex items-center justify-center">
                    <Leaf className="w-10 h-10 text-emerald-100" />
                  </div>

                  <div>
                    <p className="text-sm text-emerald-100/80">
                      Sustainability Score
                    </p>

                    <h2 className="text-4xl font-black">
                      {Math.min(
                        100,
                        Math.floor(user.total_points / 10)
                      )}
                    </h2>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </CardContent>

    </Card>
  );
}

export default HeroSection;