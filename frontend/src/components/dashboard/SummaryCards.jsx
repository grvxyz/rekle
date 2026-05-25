import { Card, CardContent } from "../ui/card.jsx";

import {
  ScanLine,
  Star,
  Recycle,
  Leaf,
} from "lucide-react";

function SummaryCards({
  user,
  favoriteCategory,
}) {
  const sustainabilityScore = Math.min(
    100,
    Math.floor(
      (user.scan_count * 5 +
        user.action_count * 10 +
        user.total_points / 20)
    )
  );

  const cards = [
    {
      title: "Total Scan",
      value: user.scan_count,
      icon: ScanLine,
      color: "text-emerald-700",
      bg: "bg-emerald-50",
      description: "Sampah berhasil dipindai",
    },
    {
      title: "Eco Actions",
      value: user.action_count,
      icon: Recycle,
      color: "text-sky-700",
      bg: "bg-sky-50",
      description: "Aksi lingkungan selesai",
    },
    {
      title: "Sustainability",
      value: `${sustainabilityScore}%`,
      icon: Leaf,
      color: "text-lime-700",
      bg: "bg-lime-50",
      description: "Skor kontribusi lingkungan",
    },
    {
      title: "Total Poin",
      value: user.total_points,
      icon: Star,
      color: "text-amber-600",
      bg: "bg-amber-50",
      description: "Reward yang dikumpulkan",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card
            key={card.title}
            className="border-0 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <CardContent className="p-5">

              <div className="flex items-start justify-between">

                <div className="space-y-2">

                  <p className="text-sm text-gray-500">
                    {card.title}
                  </p>

                  <h2 className="text-3xl font-black tracking-tight text-gray-900">
                    {card.value}
                  </h2>

                  <p className="text-xs text-gray-400">
                    {card.description}
                  </p>

                </div>

                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.bg}`}
                >
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>

              </div>

            </CardContent>
          </Card>
        );
      })}

      {/* Favorite Category */}
      <Card className="sm:col-span-2 xl:col-span-4 border-0 shadow-sm">
        <CardContent className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div className="space-y-1">
            <p className="text-sm text-gray-500">
              Kategori Sampah Paling Sering
            </p>

            <h3 className="text-2xl font-bold text-gray-900">
              {favoriteCategory || "-"}
            </h3>

            <p className="text-sm text-gray-400">
              Berdasarkan aktivitas scan terbaru kamu
            </p>
          </div>

          <div className="w-16 h-16 rounded-3xl bg-emerald-50 flex items-center justify-center">
            <Recycle className="w-8 h-8 text-emerald-700" />
          </div>

        </CardContent>
      </Card>

    </div>
  );
}

export default SummaryCards;