import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

/**
 * MitraCTABanner — inline between Features & HowItWorks
 * Requires: animejs@3.2.2
 */

const MitraCTABanner = () => {
  const ref = useRef(null);
  const hasAnimated = useRef(false);
  const animRefs = useRef([]);

  useEffect(() => {
    const getAnime = () => {
      if (typeof window !== "undefined" && typeof window.anime === "function")
        return Promise.resolve(window.anime);
      return import("animejs").then((m) => {
        const anime = m.default ?? m;
        if (typeof anime === "function") return anime;
        if (typeof m.animate === "function") {
          const a = (...args) => m.animate(...args);
          a.stagger = m.stagger;
          return a;
        }
        throw new Error("anime.js not found");
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          getAnime().then((anime) => {
            if (typeof anime !== "function") return;
            animRefs.current.push(
              anime({
                targets: ref.current,
                opacity: [0, 1],
                translateY: [16, 0],
                duration: 600,
                easing: "easeOutExpo",
              })
            );
          });
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (ref.current) observer.observe(ref.current);

    return () => {
      observer.disconnect();
      animRefs.current.forEach((a) => a && typeof a.pause === "function" && a.pause());
    };
  }, []);

  return (
    /* Padding vertikal kecil — jangan biarkan section ini punya gap besar */
    <div className="px-5 sm:px-6 py-2" style={{ background: "#f9fafb" }}>
      <div
        ref={ref}
        className="max-w-5xl mx-auto rounded-2xl px-6 sm:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{
          opacity: 0,
          background: "linear-gradient(135deg, #ecfdf5 0%, #f0fdfa 100%)",
          border: "1px solid #a7f3d0",
        }}
      >
        {/* Left */}
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div
            className="hidden sm:flex w-10 h-10 rounded-xl items-center justify-center flex-shrink-0"
            style={{ background: "#d1fae5", color: "#059669" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">
              🤝 Punya unit pengelolaan sampah?
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftarkan sebagai mitra Rekle dan perluas dampak Anda bersama komunitas kami.
            </p>
          </div>
        </div>

        {/* Right — tombol seimbang ukurannya */}
        <div className="flex gap-3 flex-shrink-0 w-full sm:w-auto">
          <Link to="/mitra/register" className="flex-1 sm:flex-none">
            <button
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:brightness-110 whitespace-nowrap"
              style={{ background: "#059669" }}
            >
              Daftar Mitra →
            </button>
          </Link>
          <Link to="/mitra/login" className="flex-1 sm:flex-none">
            <button
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:bg-emerald-50 whitespace-nowrap"
              style={{
                border: "1px solid #6ee7b7",
                color: "#059669",
                background: "white",
              }}
            >
              Sudah Mitra
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MitraCTABanner;