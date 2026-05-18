import { useEffect, useState, useCallback } from "react";
import dayjs from "dayjs";

import api from "@/lib/axios";

import StatsCard from "@/components/admin/dashboard/StatsCard";
import DashboardInsights from "@/components/admin/dashboard/DashboardInsights";
import ScanTrendChart from "@/components/admin/dashboard/ScanTrendChart";
import TopCategoryChart from "@/components/admin/dashboard/TopCategoryChart";
import SkeletonDashboard from "@/components/admin/dashboard/SkeletonDashboard";

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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [startDate, setStartDate] = useState(
    dayjs().subtract(7, "day").format("YYYY-MM-DD")
  );

  const [endDate, setEndDate] = useState(
    dayjs().format("YYYY-MM-DD")
  );

  const fetchAll = useCallback(async () => {
    try {
      setError("");

      const [
        dashboardResponse,
        timeseriesResponse,
        insightsResponse,
      ] = await Promise.all([
        api.get("/admin/dashboard", {
          params: {
            start_date: startDate,
            end_date: endDate,
          },
        }),

        api.get("/admin/analytics/timeseries", {
          params: {
            start_date: startDate,
            end_date: endDate,
          },
        }),

        api.get("/admin/analytics/insights"),
      ]);

      setDashboard({
        total_users: dashboardResponse.data?.total_users || 0,
        total_scans: dashboardResponse.data?.total_scans || 0,
        total_actions: dashboardResponse.data?.total_actions || 0,
        total_points_distributed:
          dashboardResponse.data?.total_points_distributed || 0,
        top_categories: Array.isArray(
          dashboardResponse.data?.top_categories
        )
          ? dashboardResponse.data.top_categories
          : [],
      });

      const formattedTimeseries = Array.isArray(
        timeseriesResponse.data
      )
        ? timeseriesResponse.data.map((item) => ({
            date: item.date,
            total: item.total ?? item.count ?? 0,
          }))
        : [];

      setTimeseries(formattedTimeseries);

      setInsights(
        Array.isArray(insightsResponse.data?.insights)
          ? insightsResponse.data.insights
          : []
      );
    } catch (err) {
      console.error("Dashboard Error:", err);

      if (err.response?.status === 403) {
        setError("Akses admin ditolak");
      } else {
        setError("Gagal mengambil data dashboard");
      }
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    setLoading(true);
    fetchAll();
  }, [fetchAll]);

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
        <div className="bg-red-100 text-red-600 p-4 rounded-xl">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Admin Dashboard
        </h1>

        <button
          onClick={fetchAll}
          className="bg-black text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="flex gap-4 items-center flex-wrap">
        <input
          type="date"
          value={startDate}
          onChange={(e) =>
            setStartDate(e.target.value)
          }
          className="border p-2 rounded-xl"
        />

        <span>-</span>

        <input
          type="date"
          value={endDate}
          onChange={(e) =>
            setEndDate(e.target.value)
          }
          className="border p-2 rounded-xl"
        />
      </div>

      <DashboardInsights insights={insights} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total Users"
          value={dashboard.total_users}
        />
        <StatsCard
          title="Total Scans"
          value={dashboard.total_scans}
        />
        <StatsCard
          title="Total Actions"
          value={dashboard.total_actions}
        />
        <StatsCard
          title="Total Points"
          value={dashboard.total_points_distributed}
        />
      </div>

      <ScanTrendChart data={timeseries} />

      <TopCategoryChart
        data={dashboard.top_categories}
      />
    </div>
  );
};

export default Dashboard;