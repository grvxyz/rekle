import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import LoginPage from "./pages/auth/login.jsx";
import RegisterPage from "./pages/auth/register.jsx";
import LandingPage from "./pages/landing/LandingPage.jsx";
import ScanPage from "@/pages/scan/ScanPage";

function Layout() {
  const location = useLocation();

  const hideNavbar =
    location.pathname === "/login" ||
    location.pathname === "/register";

  return (
    <div className="min-h-screen text-foreground">
      
      {!hideNavbar && <Navbar />}

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/scan" element={<ScanPage />} />
      </Routes>

    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;