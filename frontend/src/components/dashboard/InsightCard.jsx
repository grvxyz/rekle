import {
  Brain,
  Lightbulb,
  TrendingUp,
} from "lucide-react";

import { Card, CardContent } from "../ui/card.jsx";

function InsightCard({
  history = [],
}) {

  const totalScans = history.length;

  const avgConfidence =
    history.length > 0
      ? (
          history.reduce(
            (sum, item) =>
              sum + (item.confidence || 0),
            0
          ) / history.length
        ).toFixed(1)
      : 0;

    const favoriteItem = history[0]?.result;

    let latestRecommendation =
      "Lanjutkan aktivitas sustainability untuk meningkatkan kontribusi lingkungan.";

    if (favoriteItem === "Plastic") {
      latestRecommendation =
        "Aktivitas plastik cukup tinggi. Coba mulai kurangi penggunaan plastik sekali pakai.";
    }

    if (favoriteItem === "Organic") {
      latestRecommendation =
        "Sampah organik mendominasi aktivitas kamu. Pertimbangkan membuat kompos rumah tangga.";
    }

    if (favoriteItem === "Paper") {
      latestRecommendation =
        "Penggunaan kertas masih cukup tinggi. Gunakan dokumen digital untuk mengurangi limbah.";
    }

    if (favoriteItem === "Glass") {
      latestRecommendation =
        "Pisahkan sampah kaca dengan baik agar proses daur ulang lebih aman dan efisien.";
    }

  const sustainabilityLevel =
    totalScans >= 20
      ? "Sangat Aktif"
      : totalScans >= 10
      ? "Aktif"
      : "Baru Memulai";

  return (
    <Card className="h-full border-0 shadow-sm flex flex-col">

      <CardContent className="p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">

          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
            <Brain className="w-6 h-6 text-emerald-700" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900">
              AI Eco Insight
            </h2>

            <p className="text-sm text-gray-500">
              Analisis sustainability dari aktivitas kamu
            </p>
          </div>

        </div>

        {/* Stats */}
        <div className="space-y-4">

          <div className="rounded-2xl bg-sky-50 p-5">

            <div className="flex items-center gap-2 text-sky-700 mb-3">
              <TrendingUp className="w-5 h-5" />

              <span className="font-semibold">
                Akurasi AI
              </span>
            </div>

            <h3 className="text-3xl font-black text-gray-900">
              {avgConfidence}%
            </h3>

            <p className="mt-2 text-sm text-gray-600">
              Rata-rata confidence dari klasifikasi AI.
            </p>

          </div>

          <div className="rounded-2xl bg-gray-50 p-5">

            <p className="text-sm text-gray-500">
              Sustainability Level
            </p>

            <h3 className="mt-1 text-xl font-bold text-gray-900">
              {sustainabilityLevel}
            </h3>

          </div>

        </div>

        {/* Recommendation */}
        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-white p-5">

          <div className="flex items-start gap-3">

            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
              <Lightbulb className="w-5 h-5 text-amber-500" />
            </div>

            <div className="space-y-2">

              <div>
                <h3 className="font-bold text-gray-900">
                  Insight AI
                </h3>

                <p className="text-sm text-gray-500">
                  Berdasarkan aktivitas terbaru
                </p>
              </div>

              <p className="text-gray-700 leading-relaxed">
                {latestRecommendation}
              </p>

            </div>

          </div>

        </div>

      </CardContent>

    </Card>
  );
}

export default InsightCard;