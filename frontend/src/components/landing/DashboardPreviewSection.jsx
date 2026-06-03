import { useEffect, useRef } from "react";
import Button from "@/components/ui/button";
import dashboardImg from "@/assets/dashboard.png";
import { Link } from "react-router-dom";

/**
 * DashboardPreviewSection — Rekle
 * Requires: npm install animejs@3.2.2
 */

const features = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: "Analitik Emisi & Daur Ulang",
    desc: "Pahami tren daur ulangmu dan lihat langsung berapa banyak jejak karbon yang berhasil kamu kurangi setiap bulannya.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="6" />
        <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
      </svg>
    ),
    title: "Gamifikasi & Reward Nyata",
    desc: "Tukarkan poin daur ulangmu dengan voucher belanja atau donasi pohon setiap mencapai target hijau bulanan.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "Rekomendasi Berbasis AI",
    desc: "Dapatkan langkah praktis harian yang disusun khusus berdasarkan pola konsumsi dan kebiasaan klasifikasi sampahmu.",
  },
];

const DashboardPreviewSection = () => {
  const sectionRef = useRef(null);
  const textRef = useRef(null);
  const imageRef = useRef(null);
  const itemRefs = useRef([]);
  const barRefs = useRef([]);
  const tagRef = useRef(null);
  const hasAnimated = useRef(false);
  const animationsRef = useRef([]); // Menyimpan referensi animasi untuk cleanup

  useEffect(() => {
    const getAnime = () => {
      if (typeof window !== "undefined" && typeof window.anime === "function") {
        return Promise.resolve(window.anime);
      }
      return import("animejs").then((m) => {
        const anime = m.default ?? m;
        if (typeof anime === "function") return anime;
        if (typeof m.animate === "function") {
          const a = (...args) => m.animate(...args);
          a.stagger = m.stagger;
          return a;
        }
        throw new Error("anime.js: no callable export found.");
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;

          getAnime().then((anime) => {
            if (typeof anime !== "function") return;

            // ── Tag pill
            animationsRef.current.push(anime({
              targets: tagRef.current,
              opacity: [0, 1],
              translateY: [10, 0],
              duration: 600,
              easing: "easeOutExpo",
            }));

            // ── Heading words — stagger
            const heading = textRef.current?.querySelector(".rk-heading");
            if (heading) {
              const words = heading.querySelectorAll(".rk-word");
              animationsRef.current.push(anime({
                targets: words,
                opacity: [0, 1],
                translateY: [24, 0],
                delay: anime.stagger(60, { start: 120 }),
                duration: 700,
                easing: "easeOutExpo",
              }));
            }

            // ── Body copy
            animationsRef.current.push(anime({
              targets: textRef.current?.querySelector(".rk-body"),
              opacity: [0, 1],
              translateY: [16, 0],
              delay: 380,
              duration: 700,
              easing: "easeOutExpo",
            }));

            // ── Feature rows
            animationsRef.current.push(anime({
              targets: itemRefs.current,
              opacity: [0, 1],
              translateX: [-20, 0],
              delay: anime.stagger(90, { start: 520 }),
              duration: 650,
              easing: "easeOutExpo",
            }));

            // ── Progress bars
            barRefs.current.forEach((bar, i) => {
              if (!bar) return;
              animationsRef.current.push(anime({
                targets: bar,
                width: ["0%", bar.dataset.width + "%"],
                delay: 700 + i * 100,
                duration: 900,
                easing: "easeOutExpo",
              }));
            });

            // ── CTA button
            animationsRef.current.push(anime({
              targets: textRef.current?.querySelector(".rk-cta"),
              opacity: [0, 1],
              translateY: [12, 0],
              delay: 880,
              duration: 600,
              easing: "easeOutExpo",
            }));

            // ── Image card entrance
            animationsRef.current.push(anime({
              targets: imageRef.current,
              opacity: [0, 1],
              translateX: [40, 0],
              scale: [0.97, 1],
              delay: 200,
              duration: 1000,
              easing: "easeOutExpo",
            }));

            // ── Image floating loop
            animationsRef.current.push(anime({
              targets: imageRef.current,
              translateY: [0, -10, 0],
              duration: 5000,
              delay: 1200,
              loop: true,
              easing: "easeInOutSine",
              direction: "alternate",
            }));
          });

          observer.disconnect();
        }
      },
      { threshold: 0.18 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    // CLEANUP: Mencegah memory leak saat user pindah halaman sebelum animasi selesai
    return () => {
      observer.disconnect();
      animationsRef.current.forEach((anim) => {
        if (anim && typeof anim.pause === "function") anim.pause();
      });
    };
  }, []);

  const barWidths = [82, 65, 74];

  return (
    <section
      ref={sectionRef}
      className="relative py-16 md:py-28 px-4 md:px-6 overflow-hidden bg-[#f7f8f5]"
    >
      {/* ── Subtle background grid ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(74,124,89,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(74,124,89,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* ── Glow orb ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(74,124,89,0.10) 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-6xl mx-auto grid md:grid-cols-2 gap-12 md:gap-16 items-center">
        {/* ══ LEFT — Copy ══ */}
        <div ref={textRef}>
          {/* Tag */}
          <div
            ref={tagRef}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 mb-6 shadow-sm"
            style={{ opacity: 0 }}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold tracking-widest uppercase text-emerald-800">
              Dashboard Interaktif
            </span>
          </div>

          {/* Heading — words wrapped for stagger. Added ARIA for screen readers */}
          <h2 
            className="rk-heading text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-slate-900 flex flex-wrap gap-x-[0.28em] gap-y-1"
            aria-label="Pantau Jejak Karbon & Dampak Nyata"
          >
            {["Pantau", "Jejak", "Karbon", "&"].map((w) => (
              <span key={w} className="rk-word inline-block" style={{ opacity: 0 }} aria-hidden="true">
                {w}
              </span>
            ))}
            <span
              className="rk-word inline-block text-emerald-600"
              style={{ opacity: 0 }}
              aria-hidden="true"
            >
              Dampak
            </span>
            <span
              className="rk-word inline-block text-emerald-600"
              style={{ opacity: 0 }}
              aria-hidden="true"
            >
              Nyata
            </span>
          </h2>

          {/* Body */}
          <p
            className="rk-body mt-5 text-slate-600 leading-relaxed text-base md:text-lg"
            style={{ opacity: 0 }}
          >
            Tidak hanya mencatat sampah, Rekle mengubah data harianmu menjadi wawasan berharga. Lacak seberapa besar kontribusimu menyelamatkan bumi dan jadikan gaya hidup berkelanjutan lebih menyenangkan.
          </p>

          {/* Feature list */}
          <div className="mt-8 md:mt-10 space-y-6">
            {features.map((f, i) => (
              <div
                key={i}
                ref={(el) => (itemRefs.current[i] = el)}
                className="flex items-start gap-4"
                style={{ opacity: 0 }}
              >
                {/* Icon box */}
                <div className="mt-1 shrink-0 w-10 h-10 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center border border-emerald-200/50">
                  {f.icon}
                </div>

                {/* Text + bar */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-800 text-[15px]">
                    {f.title}
                  </h4>
                  <p className="text-[13.5px] text-slate-500 mt-1 leading-relaxed">
                    {f.desc}
                  </p>
                  
                  {/* Animated progress bar with Accessibility Roles */}
                  <div 
                    className="mt-3 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden"
                    role="progressbar"
                    aria-valuenow={barWidths[i]}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    <div
                      ref={(el) => (barRefs.current[i] = el)}
                      data-width={barWidths[i]}
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                      style={{ width: "0%" }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="rk-cta mt-10" style={{ opacity: 0 }}>
            <Link to="/dashboard">
              <Button className="group relative rounded-full px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-[15px] font-medium overflow-hidden transition-all duration-300 shadow-md hover:shadow-emerald-500/30 hover:-translate-y-0.5 hover:shadow-lg">
                <span className="relative z-10 flex items-center gap-2">
                  Eksplorasi Dashboard
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-transform duration-300 group-hover:translate-x-1.5"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </Button>
            </Link>
          </div>
        </div>

        {/* ══ RIGHT — Dashboard image ══ */}
        <div className="relative flex items-center justify-center mt-10 md:mt-0">
          {/* Decorative ring */}
          <div
            aria-hidden="true"
            className="absolute inset-0 m-auto w-[90%] h-[90%] rounded-3xl"
            style={{
              background:
                "radial-gradient(ellipse at 50% 50%, rgba(74,124,89,0.12) 0%, transparent 70%)",
            }}
          />

          {/* Card glow */}
          <div
            aria-hidden="true"
            className="absolute -inset-2 md:-inset-4 rounded-3xl opacity-40 blur-2xl transition-opacity duration-700"
            style={{
              background: "linear-gradient(135deg, #4a7c59, #a3ffc0)",
            }}
          />

          {/* Image */}
          <div
            ref={imageRef}
            className="relative z-10 w-full max-w-[500px]"
            style={{ opacity: 0 }}
          >
            <img
              src={dashboardImg}
              alt="Preview antarmuka analitik Rekle"
              loading="lazy"
              className="w-full rounded-2xl shadow-2xl border border-white/60 ring-1 ring-emerald-900/10 bg-slate-100 object-cover"
              style={{
                filter: "drop-shadow(0 20px 40px rgba(74,124,89,0.25))",
              }}
            />

            {/* Floating stat chip - Diperbarui agar lebih "menjual" */}
            <div
              className="absolute -bottom-5 -left-2 md:-left-6 flex items-center gap-3 bg-white/95 rounded-2xl px-4 py-3 shadow-xl border border-emerald-50"
              style={{ backdropFilter: "blur(12px)" }}
            >
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest leading-none mb-1">
                  Reduksi Emisi
                </p>
                <p className="text-sm md:text-base font-extrabold text-slate-800">12.5 Kg CO₂ Dihemat</p>
              </div>
            </div>

            {/* Floating badge chip - Diperbarui agar terkesan gamifikasi */}
            <div
              className="absolute -top-4 -right-2 md:-right-4 flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl px-4 py-2.5 shadow-lg border border-emerald-400/30"
            >
              <span className="text-lg animate-bounce">🏆</span>
              <span className="text-xs md:text-sm font-bold tracking-wide">Level: Pahlawan Bumi</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPreviewSection;