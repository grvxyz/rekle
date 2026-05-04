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
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Input } from "../../components/ui/input.jsx";
import { Label } from "../../components/ui/label.jsx";
import { Checkbox } from "../../components/ui/checkbox.jsx";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.68-.06-1.34-.18-1.97H12v3.73h5.39a4.61 4.61 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.97-4.33 2.97-7.28Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.96-.9 6.61-2.44l-3.24-2.5c-.9.6-2.05.96-3.37.96-2.59 0-4.79-1.75-5.58-4.1H3.08v2.58A9.99 9.99 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.42 13.92A5.98 5.98 0 0 1 6.1 12c0-.67.11-1.32.32-1.92V7.5H3.08A9.99 9.99 0 0 0 2 12c0 1.61.39 3.13 1.08 4.5l3.34-2.58Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.98c1.47 0 2.79.5 3.83 1.49l2.87-2.87C16.95 2.98 14.7 2 12 2A9.99 9.99 0 0 0 3.08 7.5l3.34 2.58c.79-2.35 2.99-4.1 5.58-4.1Z"
      />
    </svg>
  );
}


function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] px-4 py-6 text-foreground">
      
      <div className="w-full max-w-md">
        
        {/* LOGO */}
        <div className="mb-8 flex justify-center">
          <a href="/" className="inline-flex items-center gap-3">
            <img
              src={logo}
              alt="Logo REKLE"
              className="h-12 w-12 rounded-2xl"
            />
            <span className="text-2xl font-black">REKLE</span>
          </a>
        </div>

        {/* CARD */}
        <Card className="w-full rounded-2xl border bg-background shadow-lg">
          
          {/* HEADER */}
          <CardHeader className="px-6 pt-6">
            <CardTitle className="text-2xl font-bold">
              Masuk
            </CardTitle>
            <CardDescription className="text-sm pb-2">
              Masukkan email dan password untuk masuk ke akun Anda.
            </CardDescription>
          </CardHeader>

          {/* CONTENT */}
          <CardContent className="px-6">
            <form className="space-y-5">

              {/* EMAIL */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    className="pl-10 h-10"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="pl-10 pr-10 h-10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* CHECKBOX */}
              <div className="flex items-center space-x-2 py-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember">Ingat saya</Label>
              </div>

            </form>
          </CardContent>

          {/* FOOTER */}
          <CardFooter className="flex flex-col gap-4 px-6 pb-6 pt-2">
            
            {/* LOGIN BUTTON */}
            <Button className="w-full h-10 mb-1">
              Masuk
            </Button>

            {/* DIVIDER */}
            <div className="flex w-full items-center gap-3 my-2">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">
                atau lanjutkan dengan
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {/* GOOGLE LOGIN */}
            <Button
              variant="outline"
              className="w-full h-10 flex items-center justify-center gap-2"
            >
              <GoogleIcon />
              Login dengan Google
            </Button>

            {/* REGISTER */}
            <p className="text-sm text-center mt-2">
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