import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  AreaChart,
} from "recharts";
import dayjs from "dayjs";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-md px-4 py-2 text-sm">
      <p className="text-gray-500 mb-1">{dayjs(label).format("DD MMM YYYY")}</p>
      <p className="font-semibold text-green-700">{payload[0].value} scan</p>
    </div>
  );
};

const ScanTrendChart = ({ data }) => {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-gray-800">Tren Scan Harian</h2>
          <p className="text-xs text-gray-400 mt-0.5">Jumlah scan sampah per hari</p>
        </div>
        <span className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full font-medium">
          {data.length} hari
        </span>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
          <defs>
            <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#16a34a" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            tickFormatter={(v) => dayjs(v).format("DD/MM")}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="total"
            stroke="#16a34a"
            strokeWidth={2.5}
            fill="url(#greenGrad)"
            dot={{ r: 3, fill: "#16a34a", strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "#16a34a" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScanTrendChart;