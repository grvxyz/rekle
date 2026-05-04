import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await fetch("http://localhost:8000/api/v1/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Unauthorized");

        const data = await res.json();
        setUser(data);

      } catch (err) {
        console.error(err);
        localStorage.removeItem("access_token");
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate]);

  // 🔄 Loading state
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* HEADER */}
      <div className="max-w-4xl mx-auto mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Dashboard
        </h1>
        <p className="text-gray-500">
          Selamat datang kembali 👋
        </p>
      </div>

      {/* CARD */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-6">

        {/* USER INFO */}
        <div className="flex items-center justify-between mb-6">

          <div>
            <h2 className="text-xl font-semibold">
              {user.full_name}
            </h2>
            <p className="text-gray-500 text-sm">
              {user.email}
            </p>
          </div>

          <div className="bg-green-100 text-green-700 px-4 py-2 rounded-xl text-sm font-semibold">
            ⭐ {user.total_points} Points
          </div>

        </div>

        {/* GRID INFO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500">Kota</p>
            <p className="font-semibold text-gray-800">
              {user.city || "-"}
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500">Total Scan</p>
            <p className="font-semibold text-gray-800">
              {user.scan_count}
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500">Total Action</p>
            <p className="font-semibold text-gray-800">
              {user.action_count}
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500">Status</p>
            <p className="font-semibold text-gray-800">
              {user.is_active ? "Aktif" : "Nonaktif"}
            </p>
          </div>

          {/* 🔥 BIO FULL WIDTH */}
          <div className="p-4 bg-gray-50 rounded-xl sm:col-span-2">
            <p className="text-sm text-gray-500">Bio</p>
            <p className="font-semibold text-gray-800 leading-relaxed">
              {user.bio || "Belum ada bio"}
            </p>
          </div>

        </div>

        {/* LOGOUT */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => {
              localStorage.removeItem("access_token");
              navigate("/login");
            }}
            className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition"
          >
            Logout
          </button>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;