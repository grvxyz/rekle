import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

/**
 * CTASection — Rekle
 * Requires: animejs@3.2.2
 */

const MITRA_TYPES = [
  { icon: "🏦", label: "Bank Sampah" },
  { icon: "♻️", label: "Daur Ulang"  },
  { icon: "🧱", label: "Eco Brick"   },
  { icon: "🌿", label: "Kompos"      },
];

const SOCIAL_PROOF = [
  { initials: "AS", color: "#10b981" },
  { initials: "RD", color: "#06b6d4" },
  { initials: "FN", color: "#a78bfa" },
  { initials: "WH", color: "#f59e0b" },
];

const CTASection = () => {
  const sectionRef  = useRef(null);
  const hasAnimated = useRef(false);
  const animRefs    = useRef([]);
  const [activeCard, setActiveCard] = useState(null);

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
          const el = sectionRef.current;
          if (!el) return;

          getAnime().then((anime) => {
            if (typeof anime !== "function") return;

            anime({ targets: el.querySelector(".cta-tag"),     opacity: [0,1], translateY: [12,0], duration: 600, easing: "easeOutExpo" });
            anime({ targets: el.querySelector(".cta-heading"), opacity: [0,1], translateY: [32,0], delay: 150, duration: 700, easing: "easeOutExpo" });
            anime({ targets: el.querySelector(".cta-sub"),     opacity: [0,1], translateY: [20,0], delay: 280, duration: 600, easing: "easeOutExpo" });
            anime({ targets: el.querySelectorAll(".cta-card"), opacity: [0,1], translateY: [48,0], scale: [0.95,1], delay: anime.stagger(140, { start: 420 }), duration: 750, easing: "easeOutExpo" });
            anime({ targets: el.querySelector(".cta-note"),    opacity: [0,1], delay: 900, duration: 500, easing: "easeOutExpo" });

            // Floating orb loop
            animRefs.current.push(
              anime({ targets: el.querySelector(".cta-orb-1"), translateY: [0,-20,0], duration: 7000, loop: true, easing: "easeInOutSine", direction: "alternate" })
            );
            animRefs.current.push(
              anime({ targets: el.querySelector(".cta-orb-2"), translateY: [0,16,0],  duration: 9000, loop: true, easing: "easeInOutSine", direction: "alternate", delay: 1500 })
            );
          });

          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => {
      observer.disconnect();
      animRefs.current.forEach((a) => a?.pause?.());
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 sm:py-36 px-5 sm:px-6 overflow-hidden"
      style={{ background: "linear-gradient(160deg, #071410 0%, #0d2318 45%, #071410 100%)" }}
    >
      {/* Grid */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "linear-gradient(rgba(52,211,153,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.06) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Orbs */}
      <div className="cta-orb-1 pointer-events-none absolute -top-32 -right-24 w-[560px] h-[560px] rounded-full"
        aria-hidden="true"
        style={{ background: "radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 65%)" }} />
      <div className="cta-orb-2 pointer-events-none absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full"
        aria-hidden="true"
        style={{ background: "radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 65%)" }} />

      {/* Diagonal accent line */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-[20%] w-px h-full opacity-10"
          style={{ background: "linear-gradient(180deg, transparent, #34d399, transparent)" }} />
        <div className="absolute top-0 left-[35%] w-px h-full opacity-[0.06]"
          style={{ background: "linear-gradient(180deg, transparent, #34d399, transparent)" }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <div
            className="cta-tag inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest text-emerald-400 mb-6 border"
            style={{ opacity: 0, borderColor: "rgba(52,211,153,0.25)", background: "rgba(52,211,153,0.07)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Bergabung Sekarang
          </div>

          <h2
            className="cta-heading text-[clamp(2rem,5.5vw,3.6rem)] font-black text-white leading-[1.08] mb-5"
            style={{ opacity: 0, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.02em" }}
          >
            Siap Membuat{" "}
            <span
              className="relative inline-block"
              style={{
                background: "linear-gradient(90deg, #34d399, #06b6d4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Perubahan Nyata?
            </span>
          </h2>

          <p
            className="cta-sub text-white/45 text-base sm:text-lg max-w-xl mx-auto leading-relaxed"
            style={{ opacity: 0 }}
          >
            Pilih peranmu — pengguna biasa atau mitra pengelola sampah — dan mulai berkontribusi hari ini.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">

          {/* ── Card 1: User ── */}
          <div
            className="cta-card relative rounded-2xl p-7 sm:p-8 overflow-hidden cursor-pointer transition-all duration-300"
            style={{
              opacity: 0,
              background: activeCard === 0
                ? "linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(6,182,212,0.12) 100%)"
                : "linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(6,182,212,0.06) 100%)",
              border: activeCard === 0 ? "1px solid rgba(52,211,153,0.5)" : "1px solid rgba(52,211,153,0.2)",
              transform: activeCard === 0 ? "translateY(-6px)" : "translateY(0)",
              boxShadow: activeCard === 0 ? "0 24px 60px rgba(16,185,129,0.2)" : "none",
            }}
            onMouseEnter={() => setActiveCard(0)}
            onMouseLeave={() => setActiveCard(null)}
          >
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
              style={{ background: "linear-gradient(90deg, #10b981, #06b6d4)" }} />

            {/* Glow blob */}
            <div aria-hidden="true" className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20 transition-opacity duration-300"
              style={{ background: "radial-gradient(circle, #10b981, transparent)", opacity: activeCard === 0 ? 0.3 : 0.12 }} />

            <div className="relative z-10">
              {/* Icon */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-emerald-400"
                  style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/>
                    <path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
                    <rect x="7" y="7" width="10" height="10" rx="1"/>
                  </svg>
                </div>
                {/* Social proof avatars */}
                <div className="flex items-center gap-1">
                  <div className="flex -space-x-2">
                    {SOCIAL_PROOF.map((u, i) => (
                      <div key={i} className="w-6 h-6 rounded-full border border-[#0d2318] flex items-center justify-center text-[8px] font-bold text-white"
                        style={{ background: u.color, zIndex: 4 - i }}>
                        {u.initials}
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] text-white/35 ml-1.5">+1.2K</span>
                </div>
              </div>

              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-400 mb-2">Untuk Pengguna</p>
              <h3 className="text-xl sm:text-2xl font-black text-white mb-3"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Mulai Scan Sekarang
              </h3>
              <p className="text-white/45 text-sm leading-relaxed mb-7">
                Pindai sampah, dapatkan klasifikasi AI instan, kumpulkan poin reward, dan lacak dampak nyata Anda terhadap lingkungan.
              </p>

              {/* Feature bullets */}
              <ul className="space-y-2 mb-7">
                {["Klasifikasi 9 jenis sampah", "Reward poin & badge eksklusif", "Tantangan ekologis harian"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-[13px] text-white/55">
                    <span className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(16,185,129,0.2)" }}>
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link to="/scan">
                <button
                  className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:brightness-110 flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 20px rgba(16,185,129,0.4)" }}
                >
                  Scan Gratis Sekarang
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </Link>
            </div>
          </div>

          {/* ── Card 2: Mitra ── */}
          <div
            className="cta-card relative rounded-2xl p-7 sm:p-8 overflow-hidden cursor-pointer transition-all duration-300"
            style={{
              opacity: 0,
              background: activeCard === 1
                ? "rgba(255,255,255,0.07)"
                : "rgba(255,255,255,0.03)",
              border: activeCard === 1 ? "1px solid rgba(255,255,255,0.22)" : "1px solid rgba(255,255,255,0.09)",
              transform: activeCard === 1 ? "translateY(-6px)" : "translateY(0)",
              boxShadow: activeCard === 1 ? "0 24px 60px rgba(0,0,0,0.4)" : "none",
            }}
            onMouseEnter={() => setActiveCard(1)}
            onMouseLeave={() => setActiveCard(null)}
          >
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
              style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))" }} />

            {/* Glow blob */}
            <div aria-hidden="true" className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full transition-opacity duration-300"
              style={{ background: "radial-gradient(circle, rgba(167,139,250,0.15), transparent)", opacity: activeCard === 1 ? 0.5 : 0.2 }} />

            <div className="relative z-10">
              {/* Icon */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white/60"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.13)" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                {/* Verified badge */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  Terverifikasi
                </div>
              </div>

              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40 mb-2">Untuk Mitra</p>
              <h3 className="text-xl sm:text-2xl font-black text-white mb-3"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Daftar Jadi Mitra
              </h3>
              <p className="text-white/40 text-sm leading-relaxed mb-6">
                Bergabunglah sebagai mitra pengelola sampah. Terima setoran dari pengguna, verifikasi aksi, dan perluas dampak lingkungan Anda.
              </p>

              {/* Mitra type chips */}
              <div className="flex flex-wrap gap-2 mb-7">
                {MITRA_TYPES.map((t) => (
                  <span key={t.label} className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full font-semibold"
                    style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <span>{t.icon}</span>{t.label}
                  </span>
                ))}
              </div>

              <div className="flex gap-3">
                <Link to="/mitra/register" className="flex-1">
                  <button
                    className="w-full py-3.5 rounded-xl text-sm font-bold border text-white transition-all duration-200 hover:bg-white/10 flex items-center justify-center gap-2"
                    style={{ border: "1px solid rgba(255,255,255,0.22)", background: "rgba(255,255,255,0.06)" }}
                  >
                    Daftar Mitra
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </button>
                </Link>
                <Link to="/mitra/login">
                  <button
                    className="px-5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:bg-white/5 whitespace-nowrap"
                    style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.35)", background: "transparent" }}
                  >
                    Masuk
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom note */}
        <div className="cta-note flex flex-col sm:flex-row items-center justify-center gap-4 mt-10" style={{ opacity: 0 }}>
          {["Gratis untuk bergabung", "Tidak perlu kartu kredit", "Mulai dalam 2 menit"].map((note, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-white/25">
              {i > 0 && <span className="hidden sm:block w-1 h-1 rounded-full bg-white/15" />}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500/50">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              {note}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default CTASection;