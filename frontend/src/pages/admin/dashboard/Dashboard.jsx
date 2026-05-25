import { useEffect, useState, useCallback } from "react";
import dayjs from "dayjs";

import api from "@/lib/axios";

import StatsCard from "@/components/admin/dashboard/StatsCard";
import ScanTrendChart from "@/components/admin/dashboard/ScanTrendChart";
import TopCategoryChart from "@/components/admin/dashboard/TopCategoryChart";
import ActionDistributionChart from "@/components/admin/dashboard/ActionDistributionChart";
import InsightPanel from "@/components/admin/dashboard/InsightPanel";
import RecentActivityFeed from "@/components/admin/dashboard/RecentActivityFeed";
import TopUsersCard from "@/components/admin/dashboard/TopUsersCard";
import SkeletonDashboard from "@/components/admin/dashboard/SkeletonDashboard";

import {
  Users,
  ScanLine,
  Zap,
  Coins,
} from "lucide-react";

const PERIODS = [
  { label: "Hari", value: "day" },
  { label: "7 Hari", value: "week" },
  { label: "30 Hari", value: "month" },
  { label: "1 Tahun", value: "year" },
];

const getDateRange = (period) => {
  const end = dayjs();
  let start = end;

  switch (period) {
    case "day":
      start = end;
      break;
    case "week":
      start = end.subtract(7, "day");
      break;
    case "month":
      start = end.subtract(30, "day");
      break;
    case "year":
      start = end.subtract(365, "day");
      break;
    default:
      start = end.subtract(7, "day");
  }

  return {
    start_date: start.format("YYYY-MM-DD"),
    end_date: end.format("YYYY-MM-DD"),
  };
};

const Dashboard = () => {
  const [dashboard, setDashboard] = useState({
    total_users: 0,
    total_scans: 0,
    total_actions: 0,
    total_points_distributed: 0,
    top_categories: [],
  });

  const [timeseries, setTimeseries] = useState([]);
  const [insights, setInsights] = useState([]);
  const [insightStats, setInsightStats] = useState({});
  const [actionAnalytics, setActionAnalytics] = useState({
    by_action_type: [],
    total_points_from_actions: 0,
  });
  const [recentActions, setRecentActions] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionsLoading, setActionsLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [error, setError] = useState("");

  const [period, setPeriod] = useState("week");

  const fetchAll = useCallback(async () => {
    try {
      setError("");
      setActionsLoading(true);
      setUsersLoading(true);

      const { start_date, end_date } = getDateRange(period);

      const [
        dashboardResponse,
        timeseriesResponse,
        insightsResponse,
        actionAnalyticsResponse,
        recentActionsResponse,
        usersResponse,
      ] = await Promise.all([
        // GET /api/v1/admin/dashboard
        api.get("/admin/dashboard", {
          params: { start_date, end_date },
        }),
        // GET /api/v1/admin/analytics/timeseries
        api.get("/admin/analytics/timeseries", {
          params: { start_date, end_date },
        }),
        // GET /api/v1/admin/analytics/insights
        api.get("/admin/analytics/insights"),
        // GET /api/v1/admin/analytics/actions
        api.get("/admin/analytics/actions", {
          params: { start_date, end_date },
        }),
        // GET /api/v1/actions/pending  ← endpoint Actions (bukan admin)
        api.get("/actions/pending"),
        // GET /api/v1/admin/users
        api.get("/admin/users", { params: { limit: 50 } }),
      ]);

      // --- Dashboard stats ---
      // Response: { total_users, total_scans, total_actions, total_points_distributed, top_categories[] }
      setDashboard({
        total_users: dashboardResponse.data?.total_users || 0,
        total_scans: dashboardResponse.data?.total_scans || 0,
        total_actions: dashboardResponse.data?.total_actions || 0,
        total_points_distributed:
          dashboardResponse.data?.total_points_distributed || 0,
        top_categories: Array.isArray(dashboardResponse.data?.top_categories)
          ? dashboardResponse.data.top_categories
          : [],
      });

      // --- Timeseries ---
      // Response: array of { date, total | count }
      const formattedTimeseries = Array.isArray(timeseriesResponse.data)
        ? timeseriesResponse.data.map((item) => ({
            date: item.date,
            total: item.total ?? item.count ?? 0,
          }))
        : [];
      setTimeseries(formattedTimeseries);

      // --- Insights ---
      // Response: { insights: [], stats: {} }
      setInsights(
        Array.isArray(insightsResponse.data?.insights)
          ? insightsResponse.data.insights
          : []
      );
      setInsightStats(insightsResponse.data?.stats ?? {});

      // --- Action Analytics ---
      // Response: { by_action_type: [], total_points_from_actions: number }
      setActionAnalytics({
        by_action_type: Array.isArray(
          actionAnalyticsResponse.data?.by_action_type
        )
          ? actionAnalyticsResponse.data.by_action_type
          : [],
        total_points_from_actions:
          actionAnalyticsResponse.data?.total_points_from_actions || 0,
      });

      // --- Recent Actions (pending) ---
      // Response dari GET /api/v1/actions/pending:
      // bisa berupa array langsung, atau { items: [] }
      const actionsData = recentActionsResponse.data;
      const actionsArray = Array.isArray(actionsData)
        ? actionsData
        : Array.isArray(actionsData?.items)
        ? actionsData.items
        : [];
      setRecentActions(actionsArray.slice(0, 8));

      // --- Users ---
      // Response dari GET /api/v1/admin/users:
      // bisa berupa array langsung, atau { items: [], total: number }
      const usersData = usersResponse.data;
      const usersArray = Array.isArray(usersData)
        ? usersData
        : Array.isArray(usersData?.items)
        ? usersData.items
        : [];
      setUsers(usersArray);
    } catch (err) {
      console.error("Dashboard Error:", err);
      if (err.response?.status === 403) {
        setError("Akses admin ditolak");
      } else if (err.response?.status === 401) {
        setError("Sesi habis, silakan login kembali");
      } else {
        setError("Gagal mengambil data dashboard");
      }
    } finally {
      setLoading(false);
      setActionsLoading(false);
      setUsersLoading(false);
    }
  }, [period]);

  useEffect(() => {
    setLoading(true);
    fetchAll();
  }, [fetchAll]);

  // Auto-refresh setiap 30 detik
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAll();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  if (loading) return <SkeletonDashboard />;

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 text-red-600 p-4 rounded-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Pembaruan otomatis setiap 30 detik
          </p>
        </div>

        {/* PERIOD FILTER */}
        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 text-sm rounded-lg transition ${
                period === p.value
                  ? "bg-white shadow text-green-700 font-semibold"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Pengguna"
          value={dashboard.total_users}
          icon={Users}
          color="green"
        />
        <StatsCard
          title="Total Scan"
          value={dashboard.total_scans}
          icon={ScanLine}
          color="blue"
        />
        <StatsCard
          title="Total Aksi"
          value={dashboard.total_actions}
          icon={Zap}
          color="amber"
        />
        <StatsCard
          title="Total Poin"
          value={dashboard.total_points_distributed}
          icon={Coins}
          color="violet"
        />
      </div>

      {/* INSIGHT */}
      <InsightPanel insights={insights} stats={insightStats} />

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ScanTrendChart data={timeseries} />
        <TopCategoryChart data={dashboard.top_categories} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActionDistributionChart
          data={actionAnalytics.by_action_type}
          totalPoints={actionAnalytics.total_points_from_actions}
        />
        <TopUsersCard users={users} loading={usersLoading} />
      </div>

      {/* ACTIVITY */}
      <RecentActivityFeed actions={recentActions} loading={actionsLoading} />
    </div>
  );
};

export default Dashboard;