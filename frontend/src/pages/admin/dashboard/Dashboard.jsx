import { useEffect, useState, useCallback } from "react";
import api from "@/lib/axios";
import dayjs from "dayjs";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";


// ======================================================
// DASHBOARD COMPONENT
// ======================================================

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


  // ======================================================
  // FETCH DATA
  // ======================================================

  const fetchAll = useCallback(async () => {
    try {
      setError("");

      const [
        dashboardResponse,
        timeseriesResponse,
        insightsResponse,
      ] = await Promise.all([
        api.get("/admin/dashboard", {                  // ← fix: hapus /api/v1
          params: { start_date: startDate, end_date: endDate },
        }),
        api.get("/admin/analytics/timeseries", {       // ← fix: hapus /api/v1
          params: { start_date: startDate, end_date: endDate },
        }),
        api.get("/admin/analytics/insights"),          // ← fix: hapus /api/v1
      ]);

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

      const formattedTimeseries = Array.isArray(timeseriesResponse.data)
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


  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    setLoading(true);
    fetchAll();
  }, [fetchAll]);


  // ======================================================
  // AUTO REFRESH (30 detik)
  // ======================================================

  useEffect(() => {
    const interval = setInterval(() => {
      fetchAll();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchAll]);


  // ======================================================
  // LOADING
  // ======================================================

  if (loading) return <SkeletonDashboard />;


  // ======================================================
  // ERROR
  // ======================================================

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 text-red-600 p-4 rounded-xl">
          {error}
        </div>
      </div>
    );
  }


  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>

        <button
          onClick={fetchAll}
          className="bg-black text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors"
        >
          Refresh
        </button>
      </div>


      {/* FILTER */}
      <div className="flex gap-4 items-center flex-wrap">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border p-2 rounded-xl"
        />
        <span>-</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border p-2 rounded-xl"
        />
      </div>


      {/* INSIGHT */}
      <div className="bg-white p-5 rounded-2xl shadow">
        <h2 className="font-semibold text-lg mb-4">Insight</h2>

        {insights.length > 0 ? (
          <div className="space-y-2">
            {insights.map((text, index) => (
              <p key={index} className="text-sm text-gray-700">
                • {text}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">Belum ada insight</p>
        )}
      </div>


      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card title="Total Users"   value={dashboard.total_users} />
        <Card title="Total Scans"   value={dashboard.total_scans} />
        <Card title="Total Actions" value={dashboard.total_actions} />
        <Card title="Total Points"  value={dashboard.total_points_distributed} />
      </div>


      {/* LINE CHART — Trend Scan Harian */}
      <div className="bg-white shadow rounded-2xl p-5">
        <h2 className="text-lg font-semibold mb-4">Trend Scan Harian</h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timeseries}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#16a34a"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>


      {/* BAR CHART — Top Kategori */}
      <div className="bg-white shadow rounded-2xl p-5">
        <h2 className="text-lg font-semibold mb-4">Top Kategori</h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dashboard.top_categories}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#16a34a" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};


// ======================================================
// CARD COMPONENT
// ======================================================

const Card = ({ title, value }) => (
  <div className="bg-white shadow rounded-2xl p-5">
    <p className="text-gray-500 text-sm">{title}</p>
    <h2 className="text-3xl font-bold mt-2">{value.toLocaleString("id-ID")}</h2>
  </div>
);


// ======================================================
// SKELETON
// ======================================================

const SkeletonDashboard = () => (
  <div className="p-6 space-y-6 animate-pulse">
    <div className="h-8 bg-gray-200 w-56 rounded" />
    <div className="h-16 bg-gray-200 rounded-2xl" />
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-28 bg-gray-200 rounded-2xl" />
      ))}
    </div>
    <div className="h-80 bg-gray-200 rounded-2xl" />
    <div className="h-80 bg-gray-200 rounded-2xl" />
  </div>
);


export default Dashboard;