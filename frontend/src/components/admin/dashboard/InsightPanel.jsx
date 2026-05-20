import { Lightbulb } from "lucide-react";

const InsightPanel = ({ insights = [], stats = {} }) => {
  if (!insights.length) return null;

  const growthPct = stats.growth_percent ?? 0;
  const growthColor = growthPct >= 0 ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50";

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <span className="bg-amber-100 text-amber-600 w-8 h-8 rounded-xl flex items-center justify-center">
          <Lightbulb size={16} />
        </span>
        <div>
          <h2 className="text-base font-semibold text-gray-800">Insight Otomatis</h2>
          <p className="text-xs text-gray-400">Berdasarkan data 7 hari terakhir</p>
        </div>
        {stats.growth_percent !== undefined && (
          <span className={`ml-auto text-xs font-semibold px-3 py-1 rounded-full ${growthColor}`}>
            {growthPct >= 0 ? "+" : ""}{growthPct.toFixed(1)}% vs minggu lalu
          </span>
        )}
      </div>

      <ul className="space-y-2">
        {insights.map((text, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-700 bg-gray-50 rounded-xl px-4 py-3">
            <span className="mt-0.5 text-amber-500 shrink-0">•</span>
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InsightPanel;