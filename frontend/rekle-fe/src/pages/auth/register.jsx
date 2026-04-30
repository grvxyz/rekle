import { useState } from "react";
import logo from "../../logo.svg";
import { Button } from "../../components/ui/button.jsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card.jsx";
import { Mail, Lock, User, Eye, EyeOff, Phone } from "lucide-react";
import { Input } from "../../components/ui/input.jsx";
import { Label } from "../../components/ui/label.jsx";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4">
      <path fill="#4285F4" d="M21.6 12.23c0-.68-.06-1.34-.18-1.97H12v3.73h5.39a4.61 4.61 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.97-4.33 2.97-7.28Z"/>
      <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.61-2.44l-3.24-2.5c-.9.6-2.05.96-3.37.96-2.59 0-4.79-1.75-5.58-4.1H3.08v2.58A9.99 9.99 0 0 0 12 22Z"/>
      <path fill="#FBBC05" d="M6.42 13.92A5.98 5.98 0 0 1 6.1 12c0-.67.11-1.32.32-1.92V7.5H3.08A9.99 9.99 0 0 0 2 12c0 1.61.39 3.13 1.08 4.5l3.34-2.58Z"/>
      <path fill="#EA4335" d="M12 5.98c1.47 0 2.79.5 3.83 1.49l2.87-2.87C16.95 2.98 14.7 2 12 2A9.99 9.99 0 0 0 3.08 7.5l3.34 2.58c.79-2.35 2.99-4.1 5.58-4.1Z"/>
    </svg>
  );
}

function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] px-4 py-6">
      
      <div className="w-full max-w-md">

        {/* LOGO */}
        <div className="mb-8 flex justify-center">
          <a href="/" className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="h-12 w-12 rounded-2xl" />
            <span className="text-2xl font-black">REKLE</span>
          </a>
        </div>

        {/* CARD */}
        <Card className="rounded-2xl shadow-lg">

          {/* HEADER */}
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold">
              Daftar
            </CardTitle>
            <CardDescription>
              Buat akun baru untuk mulai menggunakan aplikasi.
            </CardDescription>
          </CardHeader>

          {/* CONTENT */}
          <CardContent>
            <form className="space-y-2">

              {/* NAME */}
              <div className="space-y-2">
                <Label>Nama</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input className="pl-10 h-10" placeholder="Nama lengkap" />
                </div>
              </div>

              {/* EMAIL */}
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input className="pl-10 h-10" type="email" placeholder="your@email.com" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Nomor Telepon</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input className="pl-10 h-10" type="number" placeholder="08xx xxxx xxxx" />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="space-y-2 pb-4">
                <Label>Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    className="pl-10 pr-10 h-10"
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
            </form>
          </CardContent>

          {/* FOOTER */}
          <CardFooter className="flex flex-col gap-4">
            
            <Button className="w-full h-10">
              Daftar
            </Button>

            <div className="flex items-center gap-3 w-full">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">atau</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <Button variant="outline" className="w-full h-10 flex gap-2 items-center justify-center">
              <GoogleIcon />
              Daftar dengan Google
            </Button>

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