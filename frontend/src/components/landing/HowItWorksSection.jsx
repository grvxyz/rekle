import { useEffect, useRef } from "react";

/**
 * HowItWorksSection — Rekle
 * Requires: animejs@3.2.2
 */

const steps = [
  {
    number: "01",
    title: "Unggah Gambar Sampah",
    desc: "Ambil foto atau unggah gambar sampah Anda langsung dari perangkat.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
      </svg>
    ),
  },
  {
    number: "02",
    title: "AI Menganalisis",
    desc: "Model AI kami mengklasifikasikan jenis sampah dengan akurasi tinggi dalam hitungan detik.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 0 1 7.38 16.75"/><path d="M12 22a10 10 0 0 1-7.38-16.75"/><circle cx="12" cy="12" r="2"/><path d="M12 8v2"/><path d="M12 14v2"/>
      </svg>
    ),
  },
  {
    number: "03",
    title: "Dapatkan Rekomendasi",
    desc: "Terima saran pembuangan cerdas, kumpulkan reward, dan lacak dampak lingkunganmu.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
];

const HowItWorksSection = () => {
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
              anime({ targets: el.querySelector(".hiw-tag"), opacity: [0, 1], translateY: [12, 0], duration: 600, easing: "easeOutExpo" })
            );
            animRefs.current.push(
              anime({ targets: el.querySelector(".hiw-heading"), opacity: [0, 1], translateY: [24, 0], delay: 150, duration: 700, easing: "easeOutExpo" })
            );
            animRefs.current.push(
              anime({ targets: el.querySelectorAll(".hiw-step"), opacity: [0, 1], translateY: [40, 0], delay: anime.stagger(120, { start: 350 }), duration: 700, easing: "easeOutExpo" })
            );
            // Connector lines draw
            animRefs.current.push(
              anime({ targets: el.querySelectorAll(".hiw-connector"), scaleX: [0, 1], delay: anime.stagger(120, { start: 700 }), duration: 500, easing: "easeOutExpo" })
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
      className="pt-10 sm:pt-14 pb-20 sm:pb-28 px-5 sm:px-6"
      style={{ background: "linear-gradient(180deg, #f9fafb 0%, #f0fdf4 60%, #f9fafb 100%)" }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <div
            className="hiw-tag inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest text-emerald-700 mb-5 border border-emerald-200 bg-emerald-50"
            style={{ opacity: 0 }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Cara Kerja
          </div>
          <h2
            className="hiw-heading text-[clamp(1.8rem,5vw,3rem)] font-black text-slate-900 leading-tight"
            style={{ opacity: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Tiga Langkah <span className="text-emerald-600">Sederhana</span>
          </h2>
        </div>

        {/* Steps */}
        <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          {/* Connectors (desktop only) */}
          <div className="hidden sm:block absolute top-10 left-[calc(33%-20px)] w-[calc(34%+40px)] h-px" aria-hidden="true">
            <div className="hiw-connector w-full h-full origin-left" style={{ background: "linear-gradient(90deg, #10b981, #06b6d4)", transform: "scaleX(0)" }} />
          </div>
          <div className="hidden sm:block absolute top-10 left-[calc(66%-20px)] w-[calc(34%+40px)] h-px" aria-hidden="true">
            <div className="hiw-connector w-full h-full origin-left" style={{ background: "linear-gradient(90deg, #06b6d4, #a78bfa)", transform: "scaleX(0)" }} />
          </div>

          {steps.map((step, i) => {
            const accents = ["#10b981", "#06b6d4", "#a78bfa"];
            const bgs = ["rgba(16,185,129,0.08)", "rgba(6,182,212,0.08)", "rgba(167,139,250,0.08)"];
            const borders = ["rgba(16,185,129,0.2)", "rgba(6,182,212,0.2)", "rgba(167,139,250,0.2)"];
            return (
              <div
                key={i}
                className="hiw-step group relative rounded-2xl p-7 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                style={{
                  opacity: 0,
                  background: "white",
                  border: `1px solid ${borders[i]}`,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                }}
              >
                {/* Step number */}
                <div
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[11px] font-black px-3 py-1 rounded-full text-white"
                  style={{ background: accents[i], letterSpacing: "0.1em" }}
                >
                  {step.number}
                </div>

                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 mt-2 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: bgs[i], border: `1px solid ${borders[i]}`, color: accents[i] }}
                >
                  {step.icon}
                </div>

                <h3
                  className="text-base font-bold text-slate-800 mb-3"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {step.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;