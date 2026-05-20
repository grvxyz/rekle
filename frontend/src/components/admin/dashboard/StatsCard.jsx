const StatsCard = ({ title, value, icon: Icon, color = "green", suffix = "", trend }) => {
  const colorMap = {
    green:  { bg: "bg-green-50",  icon: "bg-green-100 text-green-600",  val: "text-green-700" },
    blue:   { bg: "bg-blue-50",   icon: "bg-blue-100 text-blue-600",    val: "text-blue-700" },
    amber:  { bg: "bg-amber-50",  icon: "bg-amber-100 text-amber-600",  val: "text-amber-700" },
    violet: { bg: "bg-violet-50", icon: "bg-violet-100 text-violet-600",val: "text-violet-700" },
    rose:   { bg: "bg-rose-50",   icon: "bg-rose-100 text-rose-600",    val: "text-rose-700" },
    teal:   { bg: "bg-teal-50",   icon: "bg-teal-100 text-teal-600",    val: "text-teal-700" },
  };
  const c = colorMap[color] ?? colorMap.green;

  const trendColor = trend > 0 ? "text-green-600" : trend < 0 ? "text-red-500" : "text-gray-400";
  const trendSymbol = trend > 0 ? "▲" : trend < 0 ? "▼" : "–";

  return (
    <div className={`${c.bg} rounded-2xl p-5 flex flex-col gap-3 shadow-sm border border-white`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500 tracking-wide">{title}</p>
        {Icon && (
          <span className={`${c.icon} w-9 h-9 rounded-xl flex items-center justify-center`}>
            <Icon size={18} />
          </span>
        )}
      </div>

      <div className="flex items-end justify-between gap-2">
        <h2 className={`text-3xl font-bold tracking-tight ${c.val}`}>
          {typeof value === "number" ? value.toLocaleString("id-ID") : value}
          {suffix && <span className="text-lg ml-1 font-semibold">{suffix}</span>}
        </h2>

        {trend !== undefined && (
          <span className={`text-xs font-semibold pb-1 ${trendColor}`}>
            {trendSymbol} {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
};

export default StatsCard;