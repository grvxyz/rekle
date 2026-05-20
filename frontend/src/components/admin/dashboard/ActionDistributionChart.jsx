import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = ["#16a34a", "#2563eb", "#d97706", "#7c3aed", "#db2777", "#0891b2"];

const ACTION_LABEL = {
  kompos: "Kompos",
  bank_sampah: "Bank Sampah",
  daur_ulang: "Daur Ulang",
  eco_brick: "Eco Brick",
  reuse: "Reuse",
  khusus: "Penanganan Khusus",
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-md px-4 py-2 text-sm">
      <p className="text-gray-500 mb-1">{payload[0].name}</p>
      <p className="font-semibold text-gray-800">{payload[0].value} aksi</p>
    </div>
  );
};

const ActionDistributionChart = ({ data = [], totalPoints = 0 }) => {
  const formatted = data.map((d) => ({
    name: ACTION_LABEL[d.action_type] ?? d.action_type,
    value: d.count,
    raw: d.action_type,
  }));

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-800">Distribusi Tipe Aksi</h2>
          <p className="text-xs text-gray-400 mt-0.5">Jenis pengelolaan sampah yang dilakukan</p>
        </div>
        <span className="text-xs bg-violet-50 text-violet-700 px-3 py-1 rounded-full font-medium">
          {totalPoints.toLocaleString("id-ID")} poin total
        </span>
      </div>

      {formatted.length === 0 ? (
        <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">
          Belum ada data aksi
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={formatted}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
            >
              {formatted.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
              iconType="circle"
              iconSize={8}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default ActionDistributionChart;