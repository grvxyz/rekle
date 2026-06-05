import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";

const MitraLogin = () => {
  const navigate = useNavigate();
  const { login, logout, isLoggedIn } = useAuth();
  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [showPass,    setShowPass]    = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [destination, setDestination] = useState(null);

  // Navigate setelah isLoggedIn benar-benar true (state sudah terupdate)
  useEffect(() => {
    if (isLoggedIn && destination) {
      navigate(destination, { replace: true });
    }
  }, [isLoggedIn, destination, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Login → dapat token
      const { data } = await api.post("/auth/login", { email, password });

      if (!data?.access_token) {
        throw new Error("Token tidak ditemukan dari server");
      }

      // 2. Simpan token sementara supaya interceptor bisa mengirim request terautentikasi
      sessionStorage.setItem("access_token", data.access_token);
      if (data.refresh_token) {
        sessionStorage.setItem("refresh_token", data.refresh_token);
      }

      // 3. Fetch profil untuk cek role
      const { data: me } = await api.get("/users/me");

      if (me.is_superuser) {
        login({ accessToken: data.access_token, refreshToken: data.refresh_token, superuser: true });
        setDestination("/admin/dashboard");
        return;
      }

      // 4. Cek apakah user punya mitra terdaftar
      let hasMitra = false;
      try {
        const { data: mitraList } = await api.get("/mitra/mine");

        console.log("MITRA DATA:", mitraList);

        hasMitra = Array.isArray(mitraList) && mitraList.length > 0;

      } catch (err) {
        console.error("MITRA ERROR:", err);
        hasMitra = false;
      }

      // 5. Set login state, lalu useEffect yang akan navigate
      login({ accessToken: data.access_token, refreshToken: data.refresh_token, superuser: false });
      setDestination(hasMitra ? "/mitra/dashboard" : "/mitra/register");

    } catch (err) {
      logout();
      setError(err.response?.data?.detail || err.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-linear-to-br from-green-50 via-white to-emerald-50">

      {/* Left panel — visual */}
      <div className="hidden lg:flex w-1/2 bg-linear-to-br from-green-700 to-emerald-600 flex-col justify-between p-12 text-white">
        <Link to="/" className="inline-flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <span className="text-white font-black text-lg">R</span>
          </div>
          <span className="text-2xl font-black">REKLE</span>
        </Link>

        <div>
          <h1 className="text-4xl font-black leading-tight mb-4">
            Portal Mitra<br />
            <span className="text-green-200">Pengelola Sampah</span>
          </h1>
          <p className="text-green-100 text-lg mb-8">
            Kelola setoran sampah, verifikasi aksi warga, dan pantau aktivitas mitra Anda dari satu dashboard.
          </p>

          <div className="space-y-3">
            {[
              { icon: "✅", text: "Verifikasi setoran sampah warga" },
              { icon: "📊", text: "Pantau statistik mitra real-time" },
              { icon: "📍", text: "Kelola profil dan lokasi mitra" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-green-200 text-sm">
          © 2026 REKLE. Bangun kebiasaan ramah lingkungan.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-black text-lg">R</span>
              </div>
              <span className="text-xl font-black text-gray-900">REKLE</span>
            </Link>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">Masuk Portal Mitra</h2>
          <p className="text-gray-500 text-sm mb-8">
            Gunakan akun yang terdaftar sebagai mitra REKLE
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@mitra.com"
                  required
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white transition"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-11 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
            >
              {loading ? "Memproses..." : "Masuk →"}
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-gray-500">
              Belum terdaftar sebagai mitra?{" "}
              <Link to="/mitra/register" className="text-green-600 font-semibold hover:underline">
                Daftar Mitra
              </Link>
            </p>
            <p className="text-sm text-gray-400">
              Pengguna biasa?{" "}
              <Link to="/login" className="text-gray-500 hover:underline">
                Login di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MitraLogin;