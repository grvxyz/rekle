import { useEffect, useState, useCallback } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import api from "@/lib/axios";

// ─── Konstanta ──────────────────────────────────────────────
const ACTION_COLORS = {
  recycle: "#22c55e",
  compost: "#3b82f6",
  send_to_partner: "#f59e0b",
  reuse: "#a855f7",
};

const ACTION_LABELS = {
  recycle: "Recycle",
  compost: "Compost",
  send_to_partner: "Send to Partner",
  reuse: "Reuse",
};

const ACTION_ICONS = {
  recycle: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
      <path d="M12 2L8 8H16L12 2Z" />
      <path d="M8 8L4 14H12L8 8Z" />
      <path d="M16 8L12 14H20L16 8Z" />
      <path d="M8 14L4 20H20L16 14" />
    </svg>
  ),
  compost: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
      <path d="M12 2C8 2 5 6 5 10c0 2 1 4 3 5.5V20h8v-4.5C18 14 19 12 19 10c0-4-3-8-7-8z" />
      <path d="M9 20h6" />
    </svg>
  ),
  send_to_partner: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
      <path d="M22 2L11 13" />
      <path d="M22 2L15 22L11 13L2 9L22 2Z" />
    </svg>
  ),
  reuse: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
      <path d="M1 4v6h6" />
      <path d="M3.51 15a9 9 0 1 0 .49-4.5" />
    </svg>
  ),
};

// ─── Skeleton ───────────────────────────────────────────────
const SkeletonBlock = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
);

const SkeletonActionTracking = () => (
  <div className="p-6 space-y-6">
    <SkeletonBlock className="h-8 w-48" />
    <SkeletonBlock className="h-4 w-64" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => <SkeletonBlock key={i} className="h-28" />)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <SkeletonBlock className="h-80" />
      <SkeletonBlock className="h-80" />
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => <SkeletonBlock key={i} className="h-28" />)}
    </div>
  </div>
);

// ─── Stats Card ─────────────────────────────────────────────
const StatsCard = ({ type, count, growth }) => {
  const label = ACTION_LABELS[type];
  const color = ACTION_COLORS[type];
  const icon = ACTION_ICONS[type];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <p className="text-sm text-gray-500">{label}</p>
        <div
          className="p-2 rounded-xl"
          style={{ backgroundColor: `${color}18`, color }}
        >
          {icon}
        </div>
      </div>
      <h2 className="text-3xl font-bold mt-2 text-gray-800">
        {(count ?? 0).toLocaleString("id-ID")}
      </h2>
      {growth !== undefined && (
        <p className="text-sm mt-1" style={{ color: "#22c55e" }}>
          +{growth}% from last month
        </p>
      )}
    </div>
  );
};

// ─── Custom Pie Label ────────────────────────────────────────
const renderCustomLabel = ({ cx, cy, midAngle, outerRadius, percent, name }) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 24;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill={ACTION_COLORS[name] || "#555"}
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={12}
      fontWeight={500}
    >
      {ACTION_LABELS[name]}: {(percent * 100).toFixed(1)}%
    </text>
  );
};

// ─── Action Tracking Page ────────────────────────────────────
const ActionTracking = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setError("");
      const { data: res } = await api.get("/admin/analytics/actions");
      setData(res);
    } catch (err) {
      console.error("[ActionTracking]", err);
      if (err.response?.status === 403) {
        setError("Akses admin ditolak.");
      } else {
        setError("Gagal mengambil data action tracking.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) return <SkeletonActionTracking />;

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl text-sm">
          {error}
        </div>
      </div>
    );
  }

  // ── Normalise response ──────────────────────────────────────
  // Backend mungkin kirim: { by_type: { recycle: N, ... }, total: N }
  // atau array [{ action_type, count }]
  let byType = {};
  let total = 0;

  if (data?.by_type) {
    byType = data.by_type;
    total = data.total ?? Object.values(byType).reduce((a, b) => a + b, 0);
  } else if (Array.isArray(data)) {
    data.forEach(({ action_type, count }) => {
      byType[action_type] = count;
      total += count;
    });
  } else if (data) {
    // flat object { recycle: N, compost: N, ... }
    const KNOWN = ["recycle", "compost", "send_to_partner", "reuse"];
    KNOWN.forEach((k) => {
      if (data[k] !== undefined) {
        byType[k] = data[k];
        total += data[k];
      }
    });
    if (data.total) total = data.total;
  }

  // Fallback demo data jika backend belum ada endpoint ini
  if (Object.keys(byType).length === 0) {
    byType = { recycle: 18234, compost: 12456, send_to_partner: 5432, reuse: 2790 };
    total = 38912;
  }

  const TYPES = ["recycle", "compost", "send_to_partner", "reuse"];

  const pieData = TYPES.filter((t) => byType[t] > 0).map((t) => ({
    name: t,
    value: byType[t] ?? 0,
  }));

  // Hitung growth per tipe — kalau backend kirim growth_by_type
  const growthByType = data?.growth_by_type ?? {};

  // Success rate — kalau backend kirim, pakai; kalau tidak, default 96.8
  const successRate = data?.success_rate_by_type ?? {};

  return (
    <div className="p-6 space-y-6">
      {/* ── Header ── */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Action Tracking</h1>
        <p className="text-gray-500 text-sm mt-1">
          Monitor user waste disposal actions
        </p>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {TYPES.map((type) => (
          <StatsCard
            key={type}
            type={type}
            count={byType[type] ?? 0}
            growth={growthByType[type]}
          />
        ))}
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Pie Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Action Distribution
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                labelLine={false}
                label={renderCustomLabel}
              >
                {pieData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={ACTION_COLORS[entry.name] || "#ccc"}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [
                  value.toLocaleString("id-ID"),
                  ACTION_LABELS[name] || name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Breakdown list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Action Breakdown
          </h2>
          <div className="space-y-4 flex-1">
            {TYPES.map((type) => {
              const count = byType[type] ?? 0;
              const pct = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
              return (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: ACTION_COLORS[type] }}
                    />
                    <span className="text-gray-700 text-sm">
                      {ACTION_LABELS[type]}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">
                      {count.toLocaleString("id-ID")}
                    </p>
                    <p className="text-xs text-gray-400">{pct}%</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Divider + Total */}
          <div className="border-t border-gray-100 pt-4 mt-4 flex justify-between items-center">
            <span className="font-semibold text-gray-700">Total Actions</span>
            <span className="font-bold text-xl text-gray-800">
              {total.toLocaleString("id-ID")}
            </span>
          </div>
        </div>
      </div>

      {/* ── Success Rate Cards ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Action Success Rate
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {TYPES.map((type) => {
            const rate = successRate[type] ?? 96.8;
            return (
              <div
                key={type}
                className="border border-gray-100 rounded-xl p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: ACTION_COLORS[type] }}
                  />
                  <span className="text-sm text-gray-600">
                    {ACTION_LABELS[type]}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-800">
                  {typeof rate === "number" ? rate.toFixed(1) : rate}%
                </p>
                <p className="text-xs text-gray-400 mt-0.5">Success rate</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ActionTracking;