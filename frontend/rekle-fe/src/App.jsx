import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import LoginPage from "./pages/auth/login.jsx";
import RegisterPage from "./pages/auth/register.jsx";

function Layout() {
  const location = useLocation();

  // halaman yang TIDAK pakai navbar
  const hideNavbar =
    location.pathname === "/login" ||
    location.pathname === "/register";

  return (
    <div className="min-h-screen text-foreground">
      
      {/* Navbar hanya muncul jika bukan halaman auth */}
      {!hideNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<h1 className="text-center mt-10">Landing Page</h1>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
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