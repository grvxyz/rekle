import { useEffect, useState, useCallback, useRef } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "@/lib/axios";

// ─── Konstanta ───────────────────────────────────────────────────────────────
const TYPES = ["recycle", "compost", "send_to_partner", "reuse"];

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Normalisasi action_type dari backend agar cocok dengan key TYPES.
 * Backend mengirim string persis seperti "recycle", "send_to_partner", dst.
 * Fungsi ini sebagai jaring pengaman bila ada inkonsistensi casing/spasi.
 */
function normalizeType(raw) {
  if (!raw) return null;
  return raw.toLowerCase().replace(/\s+/g, "_");
}

/**
 * Proses response dari GET /admin/analytics/actions:
 * {
 *   by_action_type: [{ action_type: string, count: number }],
 *   total_points_from_actions: number
 * }
 */
function processActions(res) {
  const byType = {};
  TYPES.forEach((t) => { byType[t] = 0; });

  const rawList = res?.by_action_type ?? [];
  rawList.forEach(({ action_type, count }) => {
    const type = normalizeType(action_type);
    if (TYPES.includes(type)) {
      byType[type] = count ?? 0;
    }
  });

  const total = TYPES.reduce((sum, t) => sum + (byType[t] ?? 0), 0);
  const totalPoints = res?.total_points_from_actions ?? 0;

  // successRate tidak tersedia dari endpoint ini → tampilkan 0
  const successRate = {};
  TYPES.forEach((t) => { successRate[t] = 0; });

  return { byType, total, successRate, totalPoints };
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
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

// ─── Stats Card ───────────────────────────────────────────────────────────────
const StatsCard = ({ type, count }) => {
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
      <p className="text-xs text-gray-400 mt-1">Total actions</p>
    </div>
  );
};

// ─── Custom Pie Label ─────────────────────────────────────────────────────────
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

// ─── Realtime Badge ───────────────────────────────────────────────────────────
const RealtimeBadge = ({ lastUpdated }) => (
  <div className="flex items-center gap-2 text-xs text-gray-400">
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
    </span>
    Live · diperbarui {lastUpdated ? lastUpdated.toLocaleTimeString("id-ID") : "—"}
  </div>
);

// ─── Action Tracking Page ─────────────────────────────────────────────────────
const POLL_INTERVAL_MS = 30_000;

const ActionTracking = () => {
  const [stats, setStats] = useState(null);   // hasil processActions()
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const isMounted = useRef(true);

  const fetchData = useCallback(async () => {
    try {
      setError("");

      // GET /api/v1/admin/analytics/actions → ActionResponse[]
      const { data: res } = await api.get("/admin/analytics/actions");

      if (!isMounted.current) return;

      if (!res || typeof res !== "object" || !Array.isArray(res.by_action_type)) {
        console.warn("[ActionTracking] Response tidak dikenal:", res);
        setError("Format data dari server tidak dikenali.");
        return;
      }

      setStats(processActions(res));
      setLastUpdated(new Date());
    } catch (err) {
      if (!isMounted.current) return;
      console.error("[ActionTracking]", err);

      if (err.response?.status === 403) {
        setError("Akses admin ditolak.");
      } else if (err.response?.status === 401) {
        // Interceptor axios sudah handle refresh; ini hanya fallback UI
        setError("Sesi berakhir, silakan login ulang.");
      } else {
        setError("Gagal mengambil data action tracking.");
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    fetchData();
    const interval = setInterval(fetchData, POLL_INTERVAL_MS);
    return () => {
      isMounted.current = false;
      clearInterval(interval);
    };
  }, [fetchData]);

  // ── Loading state ─────────────────────────────────────────
  if (loading) return <SkeletonActionTracking />;

  // ── Error state ───────────────────────────────────────────
  if (error) {
    return (
      <div className="p-6 space-y-3">
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => {
              setLoading(true);
              void fetchData();
            }}
            className="text-xs underline ml-4 shrink-0"
          >
            Coba lagi
          </button>
        </div>
      </div>
    );
  }

  // ── Destrukturisasi hasil processActions ──────────────────
  const { byType, total, successRate, totalPoints } = stats ?? {
    byType: {},
    total: 0,
    successRate: {},
    totalPoints: 0,
  };

  // Pie chart hanya tampilkan tipe yang punya data
  const pieData = TYPES
    .filter((t) => byType[t] > 0)
    .map((t) => ({ name: t, value: byType[t] }));

  return (
    <div className="p-6 space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Action Tracking</h1>
          <p className="text-gray-500 text-sm mt-1">
            Monitor user waste disposal actions
          </p>
        </div>
        <RealtimeBadge lastUpdated={lastUpdated} />
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {TYPES.map((type) => (
          <StatsCard key={type} type={type} count={byType[type] ?? 0} />
        ))}
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Pie Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Action Distribution
          </h2>
          {pieData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
              Belum ada data
            </div>
          ) : (
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
          )}
        </div>

        {/* Breakdown list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Action Breakdown
          </h2>
          <div className="space-y-4 flex-1">
            {TYPES.map((type) => {
              const count = byType[type] ?? 0;
              const pct = total > 0 ? ((count / total) * 100).toFixed(1) : "0.0";
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
            const rate = successRate[type] ?? 0;
            return (
              <div key={type} className="border border-gray-100 rounded-xl p-4">
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
                  {rate.toFixed(1)}%
                </p>
                {/* Progress bar */}
                <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${rate}%`,
                      backgroundColor: ACTION_COLORS[type],
                    }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1.5">Success rate</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Total Points Summary ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">
          Total Points Distributed
        </h2>
        <p className="text-gray-400 text-xs mb-4">Akumulasi poin dari semua aksi yang disetujui</p>
        <p className="text-4xl font-bold text-gray-800">
          {totalPoints.toLocaleString("id-ID")}
          <span className="text-lg font-normal text-gray-400 ml-2">pts</span>
        </p>
      </div>
    </div>
  );
};

export default ActionTracking;