import Navbar from "./Navbar.jsx";

function MainLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">

      {/* NAVBAR */}
      <Navbar />

      {/* CONTENT */}
      <main className="flex-1">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="text-center py-6 border-t bg-white">
        <p className="text-sm text-gray-400">
          © 2026 REKLE. All rights reserved.
        </p>
      </footer>

    </div>
  );
}

export default MainLayout;