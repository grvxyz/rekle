import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../logo.svg";
import Button from "../../components/ui/button.jsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card.jsx";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import Input from "../../components/ui/input.jsx";
import Label from "../../components/ui/label.jsx";
import { Checkbox } from "../../components/ui/checkbox.jsx";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext.jsx";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Step 1: Login → dapat token
      console.log("[Login] Mengirim request login...");
      const { data } = await api.post("/auth/login", { email, password });
      console.log("[Login] Response:", data);

      if (!data.access_token) {
        throw new Error("Token tidak ditemukan dari server");
      }

      // Step 2: Simpan token sementara di sessionStorage
      // supaya interceptor axios bisa pakai saat request /users/me
      sessionStorage.setItem("access_token", data.access_token);
      if (data.refresh_token) {
        sessionStorage.setItem("refresh_token", data.refresh_token);
      }

      // Step 3: Fetch profil untuk cek is_superuser
      console.log("[Login] Mengambil data profil...");
      const { data: me } = await api.get("/users/me");
      console.log("[Login] Profil:", me);

      // Step 4: Simpan ke AuthContext (update state React)
      login({
        accessToken:  data.access_token,
        refreshToken: data.refresh_token,
        superuser:    me.is_superuser,
      });

      console.log("[Login] is_superuser:", me.is_superuser);

      // Step 5: Redirect sesuai role
      if (me.is_superuser) {
        console.log("[Login] Redirect ke /admin/dashboard");
        navigate("/admin/dashboard", { replace: true });
      } else {
        console.log("[Login] Redirect ke /dashboard");
        navigate("/dashboard", { replace: true });
      }

    } catch (err) {
      console.error("[Login] ERROR:", err);
      console.error("[Login] Response data:", err.response?.data);
      console.error("[Login] Status:", err.response?.status);

      // Bersihkan sessionStorage jika gagal
      sessionStorage.removeItem("access_token");
      sessionStorage.removeItem("refresh_token");
      sessionStorage.removeItem("is_superuser");

      setError(
        err.response?.data?.detail ||
        err.message ||
        "Login gagal"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] px-4 py-6 text-foreground">
      <div className="w-full max-w-md">

        {/* LOGO */}
        <div className="mb-8 flex justify-center">
          <a href="/" className="inline-flex items-center gap-3">
            <img src={logo} alt="Logo REKLE" className="h-12 w-12 rounded-2xl" />
            <span className="text-2xl font-black">REKLE</span>
          </a>
        </div>

        <Card className="w-full rounded-2xl border bg-background shadow-lg">

          <CardHeader className="px-6 pt-6">
            <CardTitle className="text-2xl font-bold">Masuk</CardTitle>
            <CardDescription className="text-sm pb-2">
              Masukkan email dan password untuk masuk ke akun Anda.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6">
            <form className="space-y-5" onSubmit={handleLogin}>

              {/* EMAIL */}
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    className="pl-10 h-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="space-y-2">
                <Label>Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    className="pl-10 pr-10 h-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              {/* CHECKBOX */}
              <div className="flex items-center space-x-2">
                <Checkbox />
                <Label>Ingat saya</Label>
              </div>

              {/* ERROR */}
              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              {/* BUTTON */}
              <Button type="submit" className="w-full h-10" disabled={loading}>
                {loading ? "Loading..." : "Masuk"}
              </Button>

            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 px-6 pb-6 pt-2">
            <p className="text-sm text-center">
              Belum punya akun?{" "}
              <a href="/register" className="font-semibold hover:underline">
                Daftar
              </a>
            </p>
          </CardFooter>

        </Card>
      </div>
    </div>
  );
}

export default LoginPage;