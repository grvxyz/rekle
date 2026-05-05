import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function getInitials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

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
          headers: { Authorization: `Bearer ${token}` },
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-400 animate-pulse">Memuat data...</p>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 pt-20 pb-8">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Selamat datang kembali 👋</p>
        </div>

        {/* CARD */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* PROFILE */}
          <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-100">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-semibold text-sm shrink-0">
              {getInitials(user.full_name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 truncate">{user.full_name}</p>
              <p className="text-sm text-gray-400 truncate">{user.email}</p>
            </div>
            <div className="shrink-0 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full">
              ⭐ {user.total_points} pts
            </div>
          </div>

          {/* STATS ROW */}
          <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
            <div className="px-5 py-4">
              <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">Total Scan</p>
              <p className="text-xl font-semibold text-gray-800">{user.scan_count}</p>
            </div>
            <div className="px-5 py-4">
              <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">Total Action</p>
              <p className="text-xl font-semibold text-gray-800">{user.action_count}</p>
            </div>
            <div className="px-5 py-4">
              <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">Status</p>
              <span
                className={`inline-flex items-center gap-1.5 text-sm font-medium mt-0.5 ${
                  user.is_active ? "text-green-600" : "text-gray-400"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    user.is_active ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
                {user.is_active ? "Aktif" : "Nonaktif"}
              </span>
            </div>
          </div>

          {/* DETAIL INFO */}
          <div className="grid grid-cols-2 divide-x divide-gray-100 border-b border-gray-100">
            <div className="px-5 py-4">
              <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">Kota</p>
              <p className="text-sm font-medium text-gray-700">{user.city || "—"}</p>
            </div>
            <div className="px-5 py-4">
              <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">Bergabung</p>
              <p className="text-sm font-medium text-gray-700">
                {user.created_at
                  ? new Date(user.created_at).toLocaleDateString("id-ID", {
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}
              </p>
            </div>
          </div>

          {/* BIO */}
          <div className="px-6 py-4 border-b border-gray-100">
            <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">Bio</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              {user.bio || "Belum ada bio."}
            </p>
          </div>

          {/* FOOTER */}
          <div className="px-6 py-4 flex justify-end">
            <button
              onClick={handleLogout}
              className="text-sm text-red-500 border border-red-200 hover:bg-red-50 px-4 py-1.5 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;