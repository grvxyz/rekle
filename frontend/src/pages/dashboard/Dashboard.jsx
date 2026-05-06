import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import HeroSection from "../../components/dashboard/HeroSection.jsx";
import SummaryCards from "../../components/dashboard/SummaryCards.jsx";
import InsightCard from "../../components/dashboard/InsightCard.jsx";
import ActivityChart from "../../components/dashboard/ActivityChart.jsx";
import RecentHistory from "../../components/dashboard/RecentHistory.jsx";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [favoriteCategory, setFavoriteCategory] = useState("-");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    console.log("TOKEN DASHBOARD:", token);

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchAll = async () => {
      try {
        const userRes = await fetch("http://localhost:8000/api/v1/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!userRes.ok) throw new Error("Unauthorized user");

        const userData = await userRes.json();
        setUser(userData);

        const historyRes = await fetch(
          "http://localhost:8000/api/v1/scan/history",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!historyRes.ok) {
          console.warn("History API gagal:", historyRes.status);
          setHistory([]);
          processInsight([]);
          return;
        }

        const historyData = await historyRes.json();

        const items = historyData.items || [];

        setHistory(items);
        processInsight(items);
      } catch (err) {
        console.error(err);
        localStorage.removeItem("access_token");
        navigate("/login");
      }
    };

    fetchAll();
  }, [navigate]);

  const processInsight = (items = []) => {
    if (!items.length) {
      setChartData([]);
      setFavoriteCategory("-");
      return;
    }

    const countByDate = {};
    const categoryCount = {};

    items.forEach((item) => {
      const date = new Date(item.created_at).toLocaleDateString("id-ID");

      countByDate[date] = (countByDate[date] || 0) + 1;
      categoryCount[item.result] = (categoryCount[item.result] || 0) + 1;
    });

    const chart = Object.keys(countByDate).map((date) => ({
      date,
      total: countByDate[date],
    }));

    setChartData(chart);

    let max = 0;
    let fav = "-";

    for (let key in categoryCount) {
      if (categoryCount[key] > max) {
        max = categoryCount[key];
        fav = key;
      }
    }

    setFavoriteCategory(fav);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-400 animate-pulse">
          Memuat dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 pt-24 pb-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <HeroSection user={user} navigate={navigate} />
        <SummaryCards
          user={user}
          favoriteCategory={favoriteCategory}
        />
        <InsightCard user={user} />
        <ActivityChart data={chartData} />
        <RecentHistory history={history} />
      </div>
    </div>
  );
}

export default Dashboard;