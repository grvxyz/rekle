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
import { Mail, Lock, User, Eye, EyeOff, Phone } from "lucide-react";
import Input from "../../components/ui/input.jsx";
import Label from "../../components/ui/label.jsx";
import api from "@/lib/axios";

function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail]       = useState("");
  const [phone, setPhone]       = useState("");
  const [city, setCity]         = useState("");
  const [bio, setBio]           = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password.length < 8) {
      setError("Password minimal 8 karakter");
      setLoading(false);
      return;
    }

    try {
      await api.post("/auth/register", {
        email:        email.trim(),
        full_name:    fullName.trim(),
        password:     password,
        phone_number: phone.trim() || null,
        city:         city.trim() || null,
        bio:          bio.trim() || null,
      });

      navigate("/login");

    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
        err.message ||
        "Terjadi kesalahan"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] px-4 py-6">
      <div className="w-full max-w-md">

        <div className="mb-8 flex justify-center">
          <a href="/" className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="h-12 w-12 rounded-2xl" />
            <span className="text-2xl font-black">REKLE</span>
          </a>
        </div>

        <Card className="rounded-2xl shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold">Daftar</CardTitle>
            <CardDescription>
              Buat akun baru untuk mulai menggunakan aplikasi.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form className="space-y-3" onSubmit={handleRegister}>

              <div className="space-y-2">
                <Label>Nama</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    className="pl-10 h-10"
                    placeholder="Nama lengkap"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    className="pl-10 h-10"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Nomor Telepon</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    className="pl-10 h-10"
                    type="text"
                    placeholder="08xx xxxx xxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Kota</Label>
                <Input
                  className="h-10"
                  placeholder="Contoh: Jogja"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Bio</Label>
                <textarea
                  className="w-full border rounded-md p-2 text-sm"
                  placeholder="Tentang kamu..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

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
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              <Button className="w-full h-10" type="submit" disabled={loading}>
                {loading ? "Loading..." : "Daftar"}
              </Button>

            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <p className="text-sm text-center">
              Sudah punya akun?{" "}
              <a href="/login" className="font-semibold hover:underline">
                Masuk
              </a>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default RegisterPage;