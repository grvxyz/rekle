import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

/**
 * CarouselSection — Rekle Hero
 * Stats dengan skeleton shimmer, lalu muncul dummy data.
 * Requires: animejs@3.2.2
 */

const DUMMY_STATS = [
  { value: "1.2K", label: "Pengguna Terdaftar" },
  { value: "98%",  label: "Akurasi AI"          },
  { value: "4.7K", label: "Sampah Terklasifikasi" },
];

const CarouselSection = () => {
  const heroRef     = useRef(null);
  const hasAnimated = useRef(false);
  const animRefs    = useRef([]);

  const [statsReady, setStatsReady] = useState(false);

  // Simulasi loading — skeleton 1.2 detik lalu muncul data
  useEffect(() => {
    const t = setTimeout(() => setStatsReady(true), 1200);
    return () => clearTimeout(t);
  }, []);

  // Animasi
  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

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

    getAnime().then((anime) => {
      if (typeof anime !== "function") return;
      const el = heroRef.current;
      if (!el) return;

      animRefs.current.push(
        anime({ targets: el.querySelector(".hero-badge"), opacity: [0, 1], translateY: [16, 0], duration: 700, easing: "easeOutExpo", delay: 200 })
      );

      const words = el.querySelectorAll(".hero-word");
      if (words.length) {
        animRefs.current.push(
          anime({ targets: words, opacity: [0, 1], translateY: [40, 0], rotateX: [20, 0], delay: anime.stagger(60, { start: 400 }), duration: 800, easing: "easeOutExpo" })
        );
      }

      animRefs.current.push(
        anime({ targets: el.querySelector(".hero-sub"), opacity: [0, 1], translateY: [20, 0], delay: 900, duration: 700, easing: "easeOutExpo" })
      );

      animRefs.current.push(
        anime({ targets: el.querySelectorAll(".hero-cta-item"), opacity: [0, 1], translateY: [20, 0], delay: anime.stagger(100, { start: 1050 }), duration: 600, easing: "easeOutExpo" })
      );

      animRefs.current.push(
        anime({ targets: el.querySelectorAll(".hero-stat"), opacity: [0, 1], translateY: [24, 0], delay: anime.stagger(80, { start: 1300 }), duration: 600, easing: "easeOutExpo" })
      );

      animRefs.current.push(
        anime({ targets: el.querySelector(".orb-1"), translateY: [0, -18, 0], duration: 6000, loop: true, easing: "easeInOutSine", direction: "alternate" })
      );
      animRefs.current.push(
        anime({ targets: el.querySelector(".orb-2"), translateY: [0, 14, 0], duration: 8000, loop: true, easing: "easeInOutSine", direction: "alternate", delay: 1000 })
      );
    });

    return () => {
      animRefs.current.forEach((a) => a && typeof a.pause === "function" && a.pause());
    };
  }, []);

  const headlineWords = ["Smarter", "Waste", "Classification", "with", "AI"];

  return (
    <section
      ref={heroRef}
      className="relative w-full min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0d1f14 0%, #0f2d1c 40%, #0b1c13 100%)" }}
    >
      {/* Grid texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage: "linear-gradient(rgba(52,211,153,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.15) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Orbs */}
      <div aria-hidden="true" className="orb-1 pointer-events-none absolute top-[-120px] left-[-100px] w-[600px] h-[600px] rounded-full opacity-30"
        style={{ background: "radial-gradient(circle, rgba(52,211,153,0.35) 0%, transparent 65%)" }} />
      <div aria-hidden="true" className="orb-2 pointer-events-none absolute bottom-[-80px] right-[-80px] w-[480px] h-[480px] rounded-full opacity-25"
        style={{ background: "radial-gradient(circle, rgba(16,185,129,0.3) 0%, transparent 65%)" }} />

      {/* Noise grain */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")", backgroundRepeat: "repeat", backgroundSize: "180px" }} />

      {/* Content */}
      <div className="relative z-10 text-center px-5 sm:px-6 max-w-5xl mx-auto pt-24 pb-20">

        {/* Badge */}
        <div
          className="hero-badge inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-8 mx-auto"
          style={{ opacity: 0, background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)" }}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-emerald-300">
            Rekle — Platform Daur Ulang Cerdas
          </span>
        </div>

        {/* Headline */}
        <h1
          className="text-[clamp(2.6rem,8vw,5.5rem)] font-black leading-[1.05] mb-6 flex flex-wrap justify-center gap-x-[0.22em] gap-y-1"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          aria-label="Smarter Waste Classification with AI"
        >
          {headlineWords.map((w, i) => (
            <span
              key={i}
              className={`hero-word inline-block ${(w === "Classification" || w === "AI") ? "text-emerald-400" : "text-white"}`}
              style={{ opacity: 0 }}
              aria-hidden="true"
            >
              {w}
            </span>
          ))}
        </h1>

        {/* Sub */}
        <p
          className="hero-sub text-[clamp(1rem,2.5vw,1.2rem)] text-emerald-100/65 max-w-2xl mx-auto leading-relaxed mb-10"
          style={{ opacity: 0 }}
        >
          Pindai sampah Anda dan dapatkan rekomendasi ramah lingkungan secara instan.
          Bergabunglah dalam revolusi pengelolaan sampah berkelanjutan.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Link to="/scan" className="hero-cta-item w-full sm:w-auto" style={{ opacity: 0 }}>
            <button
              className="w-full sm:w-auto relative group px-8 py-3.5 rounded-full text-sm font-bold text-white overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 24px rgba(16,185,129,0.4)" }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Mulai Scan Gratis
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:translate-x-1">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </button>
          </Link>

          <a href="#features" className="hero-cta-item w-full sm:w-auto" style={{ opacity: 0 }}>
            <button
              className="w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-bold border transition-all duration-300 hover:scale-105"
              style={{ border: "1px solid rgba(52,211,153,0.4)", color: "#6ee7b7", background: "rgba(52,211,153,0.06)" }}
            >
              Pelajari Lebih Lanjut
            </button>
          </a>
        </div>

        {/* Stats dengan skeleton shimmer */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-12 flex-wrap">
          {DUMMY_STATS.map((s, i) => (
            <div key={i} className="hero-stat text-center" style={{ opacity: 0 }}>
              {!statsReady ? (
                /* Skeleton */
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="h-8 w-16 rounded-lg"
                    style={{
                      background: "linear-gradient(90deg, rgba(255,255,255,0.07) 25%, rgba(255,255,255,0.13) 50%, rgba(255,255,255,0.07) 75%)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 1.4s infinite",
                    }}
                  />
                  <div
                    className="h-2.5 w-24 rounded-full"
                    style={{
                      background: "linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 1.4s infinite",
                      animationDelay: `${i * 0.15}s`,
                    }}
                  />
                </div>
              ) : (
                /* Data */
                <>
                  <p
                    className="text-2xl sm:text-3xl font-black text-white"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    {s.value}
                  </p>
                  <p className="text-xs text-emerald-400/70 uppercase tracking-widest mt-0.5">
                    {s.label}
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-emerald-400/50">
        <span className="text-[10px] uppercase tracking-widest">Scroll</span>
        <div className="w-px h-8 bg-emerald-400/30 animate-pulse" />
      </div>

      {/* Shimmer keyframe */}
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </section>
  );
};

export default CarouselSection;