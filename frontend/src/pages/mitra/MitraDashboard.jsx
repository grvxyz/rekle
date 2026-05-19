import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle, Clock, XCircle,
  TrendingUp, MapPin, Phone, Globe,
} from "lucide-react";
import api from "@/lib/axios";

// ─── Constants ─────────────────────────────────────────────
const MITRA_TYPE_CONFIG = {
  bank_sampah: { label: "Bank Sampah",  bg: "bg-green-100",  text: "text-green-700"  },
  daur_ulang:  { label: "Daur Ulang",   bg: "bg-blue-100",   text: "text-blue-700"   },
  eco_brick:   { label: "Eco Brick",    bg: "bg-orange-100", text: "text-orange-700" },
  kompos:      { label: "Kompos",       bg: "bg-yellow-100", text: "text-yellow-700" },
};

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const MitraDashboard = () => {
  const [mitra,         setMitra]         = useState(null);
  const [pendingCount,  setPendingCount]  = useState(0);
  const [recentActions, setRecentActions] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");
  const [stats,         setStats]         = useState({ approved: 0, rejected: 0, total: 0 });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch mitra milik user yang sedang login
      const mitraRes = await api.get("/mitra/mine");
      const mitraList = Array.isArray(mitraRes.data) ? mitraRes.data : [];
      const currentMitra = mitraList[0] || null;
      setMitra(currentMitra);

      if (!currentMitra) return;

      // Fetch pending count dan aksi pending secara paralel
      const [countRes, actionsRes, allActionsRes] = await Promise.all([
        api.get("/mitra/mine/actions/pending/count"),
        api.get("/mitra/mine/actions/pending"),
        api.get("/mitra/mine/actions"),
      ]);

      setPendingCount(countRes.data?.count ?? 0);

      const pending = Array.isArray(actionsRes.data) ? actionsRes.data : [];
      setRecentActions(pending.slice(0, 5));

      // Hitung stats dari semua aksi
      const all = Array.isArray(allActionsRes.data) ? allActionsRes.data : [];
      setStats({
        approved: all.filter((a) => a.status === "approved").length,
        rejected: all.filter((a) => a.status === "rejected").length,
        total:    all.length,
      });

    } catch (err) {
      setError("Gagal memuat data dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-2xl" />
          ))}
        </div>
        <div className="h-48 bg-gray-200 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard Mitra 👋
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Selamat datang di portal mitra REKLE
          </p>
        </div>

        {pendingCount > 0 && (
          <Link
            to="/mitra/verifikasi"
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition"
          >
            <Clock className="w-4 h-4" />
            {pendingCount} Menunggu Verifikasi
          </Link>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      {/* Profil Mitra Singkat */}
      {mitra ? (
        <div className="bg-linear-to-br from-green-600 to-emerald-500 rounded-2xl p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {(() => {
                  const cfg = MITRA_TYPE_CONFIG[mitra.mitra_type];
                  return (
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg?.bg} ${cfg?.text}`}>
                      {cfg?.label || mitra.mitra_type}
                    </span>
                  );
                })()}
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  mitra.is_active ? "bg-white/20 text-white" : "bg-red-400/30 text-white"
                }`}>
                  {mitra.is_active ? "● Aktif" : "● Nonaktif"}
                </span>
              </div>
              <h2 className="text-2xl font-black">{mitra.name}</h2>
              {mitra.description && (
                <p className="text-green-100 text-sm mt-1 max-w-md">{mitra.description}</p>
              )}
            </div>
            <Link
              to="/mitra/profil"
              className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl text-sm font-medium transition"
            >
              Edit Profil
            </Link>
          </div>

          <div className="flex flex-wrap gap-4 mt-4 text-sm text-green-100">
            {mitra.city && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" /> {mitra.city}
              </div>
            )}
            {mitra.phone && (
              <div className="flex items-center gap-1.5">
                <Phone className="w-4 h-4" /> {mitra.phone}
              </div>
            )}
            {mitra.website && (
              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4" /> {mitra.website}
              </div>
            )}
          </div>

          {mitra.accepted_waste && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {mitra.accepted_waste.split(",").map((w) => (
                <span
                  key={w}
                  className="text-xs bg-white/20 px-2.5 py-1 rounded-full capitalize"
                >
                  {w.trim().replace(/_/g, " ")}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
          <p className="text-amber-700 font-semibold mb-3">
            Anda belum memiliki data mitra terdaftar
          </p>
          {/* Arahkan ke /mitra/profil — MitraProfil menangani mode isNew otomatis */}
          <Link
            to="/mitra/profil"
            className="inline-block bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-xl text-sm font-semibold transition"
          >
            Daftarkan Mitra Sekarang
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Clock}
          label="Menunggu Verifikasi"
          value={pendingCount}
          color="bg-amber-50 text-amber-600"
          sub="Perlu ditindaklanjuti"
        />
        <StatCard
          icon={CheckCircle}
          label="Dikonfirmasi"
          value={stats.approved}
          color="bg-green-50 text-green-600"
          sub="Total disetujui"
        />
        <StatCard
          icon={XCircle}
          label="Ditolak"
          value={stats.rejected}
          color="bg-red-50 text-red-500"
          sub="Total ditolak"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Aksi"
          value={stats.total}
          color="bg-blue-50 text-blue-600"
          sub="Semua waktu"
        />
      </div>

      {/* Aksi Pending Terbaru */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="font-semibold text-gray-900">Aksi Menunggu Verifikasi</h3>
          <Link
            to="/mitra/verifikasi"
            className="text-sm text-green-600 hover:underline font-medium"
          >
            Lihat Semua →
          </Link>
        </div>

        {recentActions.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <span className="text-4xl block mb-3">✅</span>
            <p className="font-medium text-gray-500">Tidak ada aksi pending saat ini</p>
            <p className="text-sm mt-1">Semua setoran telah diproses</p>
          </div>
        ) : (
          <div className="divide-y">
            {recentActions.map((action) => (
              <div key={action.id} className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {action.action_type?.replace(/_/g, " ")}
                    {action.partner_name && ` — ${action.partner_name}`}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {action.created_at
                      ? new Date(action.created_at).toLocaleDateString("id-ID", {
                          day: "numeric", month: "short", year: "numeric",
                        })
                      : "-"}
                  </p>
                </div>
                <span className="shrink-0 text-xs font-semibold px-3 py-1 rounded-full bg-amber-100 text-amber-700">
                  Pending
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { to: "/mitra/verifikasi", icon: "✅", label: "Verifikasi Setoran",  desc: "Konfirmasi aksi warga",   color: "bg-green-50 border-green-200"   },
          { to: "/mitra/profil",     icon: "🏢", label: "Profil Mitra",        desc: "Edit info & lokasi",       color: "bg-blue-50 border-blue-200"     },
          { to: "/mitra/riwayat",    icon: "📋", label: "Riwayat Verifikasi",  desc: "Histori semua aksi",       color: "bg-purple-50 border-purple-200" },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`rounded-2xl border p-5 hover:shadow-md transition ${item.color}`}
          >
            <span className="text-3xl block mb-2">{item.icon}</span>
            <p className="font-semibold text-gray-900 text-sm">{item.label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
          </Link>
        ))}
      </div>

    </div>
  );
};

export default MitraDashboard;