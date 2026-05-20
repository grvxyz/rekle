import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Tooltip,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#16a34a", "#2563eb", "#d97706", "#7c3aed", "#db2777", "#0891b2"];

const LABEL_MAP = {
  organik: "Organik",
  plastik_pet: "Plastik PET",
  plastik_hdpe: "Plastik HDPE",
  plastik_campuran: "Plastik Camp.",
  kertas_bersih: "Kertas Bersih",
  kertas_kotor: "Kertas Kotor",
  kaca_utuh: "Kaca Utuh",
  kaca_pecah: "Kaca Pecah",
};

// Tooltip modern
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;

  const data = payload[0];

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-md px-4 py-2 text-sm">
      <p className="text-gray-500">
        {LABEL_MAP[data.name] ?? data.name}
      </p>
      <p className="font-semibold text-gray-800">
        {data.value} scan
      </p>
    </div>
  );
};

const TopCategoryChart = ({ data }) => {
  const formatted = data.map((d) => ({
    name: d.category,
    value: d.count,
  }));

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      
      {/* HEADER */}
      <div className="mb-5">
        <h2 className="text-base font-semibold text-gray-800">
          Top Kategori Sampah
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Distribusi hasil deteksi AI
        </p>
      </div>

      {/* PIE CHART */}
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>

            <Pie
              data={formatted}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={95}
              innerRadius={55}   // <- bikin donut chart (lebih modern)
              paddingAngle={3}
            >
              {formatted.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>

            <Tooltip content={<CustomTooltip />} />

            {/* Legend lebih clean */}
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              formatter={(value) =>
                LABEL_MAP[value] ?? value
              }
            />

          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TopCategoryChart;