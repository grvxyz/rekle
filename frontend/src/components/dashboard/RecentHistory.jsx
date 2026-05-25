import {
  Clock3,
  ScanLine,
  Brain,
  ChevronRight,
} from "lucide-react";

import { Card, CardContent } from "../ui/card.jsx";

function RecentHistory({
  history = [],
}) {

  const formatDate = (dateString) => {
    if (!dateString) return "-";

    return new Date(dateString).toLocaleDateString(
      "id-ID",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  return (
    <Card className="border-0 shadow-sm overflow-hidden">

      <CardContent className="p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">

          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Aktivitas Terbaru
            </h2>

            <p className="text-sm text-gray-500">
              Riwayat scan dan analisis AI terbaru
            </p>
          </div>

          <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center">
            <Clock3 className="w-5 h-5 text-emerald-700" />
          </div>

        </div>

        {/* Empty State */}
        {history.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-200 p-10 text-center">

            <div className="w-14 h-14 rounded-2xl bg-gray-100 mx-auto flex items-center justify-center">
              <ScanLine className="w-7 h-7 text-gray-400" />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              Belum Ada Aktivitas
            </h3>

            <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
              Mulai scan sampah untuk melihat riwayat aktivitas
              dan insight AI di dashboard.
            </p>

          </div>
        )}

        {/* Timeline */}
        <div className="space-y-4">

          {history.slice(0, 5).map((item, index) => (
            <div
              key={index}
              className="relative flex gap-4 rounded-2xl border border-gray-100 bg-white p-4 transition-all hover:border-emerald-100 hover:shadow-sm"
            >

              {/* Timeline Line */}
              {index !== history.length - 1 && (
                <div className="absolute left-[31px] top-16 h-full w-px bg-gray-100" />
              )}

              {/* Icon */}
              <div className="relative z-10 w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
                <Brain className="w-5 h-5 text-emerald-700" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-3">

                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">

                  <div className="space-y-1">

                    <div className="flex items-center gap-2 flex-wrap">

                      <h3 className="font-semibold text-gray-900">
                        {item.result}
                      </h3>

                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                        {item.confidence?.toFixed(1)}%
                      </span>

                    </div>

                    <p className="text-sm text-gray-600 leading-relaxed">
                      {item.recommendation}
                    </p>

                  </div>

                  <div className="flex items-center gap-1 text-sm text-gray-400 shrink-0">
                    <Clock3 className="w-4 h-4" />

                    <span>
                      {formatDate(item.created_at)}
                    </span>
                  </div>

                </div>

                {/* Footer */}
                <div className="flex items-center gap-2 text-sm text-emerald-700 font-medium">

                  <ScanLine className="w-4 h-4" />

                  <span>AI Classification Completed</span>

                  <ChevronRight className="w-4 h-4" />

                </div>

              </div>

            </div>
          ))}

        </div>

      </CardContent>

    </Card>
  );
}

export default RecentHistory;