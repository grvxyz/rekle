import { useEffect, useRef } from "react";
import { Brain, Recycle, Gift, Target } from "lucide-react";

/**
 * FeaturesSection — Rekle
 * Requires: animejs@3.2.2
 */

const features = [
  {
    Icon: Brain,
    title: "Deteksi AI",
    desc: "Model berbasis CNN canggih untuk klasifikasi jenis sampah secara akurat dan cepat.",
    accent: "#10b981",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.2)",
  },
  {
    Icon: Recycle,
    title: "Rekomendasi Cerdas",
    desc: "Dapatkan saran pembuangan ramah lingkungan yang dipersonalisasi sesuai kebutuhan Anda.",
    accent: "#06b6d4",
    bg: "rgba(6,182,212,0.08)",
    border: "rgba(6,182,212,0.2)",
  },
  {
    Icon: Gift,
    title: "Sistem Reward",
    desc: "Kumpulkan poin dan raih badge eksklusif sebagai apresiasi kontribusi nyata Anda.",
    accent: "#a78bfa",
    bg: "rgba(167,139,250,0.08)",
    border: "rgba(167,139,250,0.2)",
  },
  {
    Icon: Target,
    title: "Tantangan Ekologis",
    desc: "Selesaikan tantangan dan berkompetisi demi gaya hidup yang lebih berkelanjutan.",
    accent: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.2)",
  },
];

const FeaturesSection = () => {
  const sectionRef = useRef(null);
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
          const el = sectionRef.current;
          if (!el) return;

          getAnime().then((anime) => {
            if (typeof anime !== "function") return;

            animRefs.current.push(
              anime({ targets: el.querySelector(".feat-tag"), opacity: [0, 1], translateY: [12, 0], duration: 600, easing: "easeOutExpo" })
            );
            animRefs.current.push(
              anime({ targets: el.querySelector(".feat-heading"), opacity: [0, 1], translateY: [24, 0], delay: 150, duration: 700, easing: "easeOutExpo" })
            );
            animRefs.current.push(
              anime({ targets: el.querySelector(".feat-sub"), opacity: [0, 1], translateY: [16, 0], delay: 280, duration: 600, easing: "easeOutExpo" })
            );
            animRefs.current.push(
              anime({ targets: el.querySelectorAll(".feat-card"), opacity: [0, 1], translateY: [32, 0], scale: [0.95, 1], delay: anime.stagger(80, { start: 400 }), duration: 700, easing: "easeOutExpo" })
            );
          });

          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => {
      observer.disconnect();
      animRefs.current.forEach((a) => a && typeof a.pause === "function" && a.pause());
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="features"
      className="sm:pt-28 pb-8 sm:pb-10 px-5 sm:px-6"
      style={{ background: "#f9fafb" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <div
            className="feat-tag inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest text-emerald-700 mb-5 border border-emerald-200 bg-emerald-50"
            style={{ opacity: 0 }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Fitur Platform
          </div>
          <h2
            className="feat-heading text-[clamp(1.8rem,5vw,3rem)] font-black text-slate-900 leading-tight mb-4"
            style={{ opacity: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Fitur Unggulan untuk{" "}
            <span className="text-emerald-600">Masa Depan Lebih Hijau</span>
          </h2>
          <p
            className="feat-sub text-slate-500 text-base sm:text-lg max-w-2xl mx-auto"
            style={{ opacity: 0 }}
          >
            Semua yang Anda butuhkan untuk mengelola sampah secara berkelanjutan
            sekaligus mendapatkan berbagai reward menarik.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {features.map((item, i) => (
            <div
              key={i}
              className="feat-card group relative rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
              style={{
                opacity: 0,
                background: "white",
                border: `1px solid ${item.border}`,
                boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
              }}
            >
              {/* Hover overlay */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: item.bg }}
                aria-hidden="true"
              />

              <div className="relative z-10">
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: item.bg, border: `1px solid ${item.border}` }}
                >
                  <item.Icon style={{ color: item.accent }} className="w-5 h-5" />
                </div>

                <h3
                  className="text-[15px] font-bold text-slate-800 mb-2 transition-colors duration-300 group-hover:text-slate-900"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {item.title}
                </h3>
                <p className="text-[13px] text-slate-500 leading-relaxed">{item.desc}</p>

                {/* Arrow indicator */}
                <div
                  className="mt-4 flex items-center gap-1 text-[12px] font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-4px] group-hover:translate-x-0"
                  style={{ color: item.accent }}
                >
                  Pelajari
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;