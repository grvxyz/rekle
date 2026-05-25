import { useEffect, useRef } from "react";
import Button from "@/components/ui/button";
import dashboardImg from "@/assets/dashboard.jpg";
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
    title: "Analitik Mingguan & Bulanan",
    desc: "Pantau tren klasifikasi sampahmu secara berkala",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="6" />
        <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
      </svg>
    ),
    title: "Badge Pencapaian",
    desc: "Buka berbagai badge saat kamu mencapai milestone baru",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "Tips & Rekomendasi Ramah Lingkungan",
    desc: "Dapatkan tips personal untuk meningkatkan gaya hidup berkelanjutan",
  },
];

const DashboardPreviewSection = () => {
  const sectionRef  = useRef(null);
  const textRef     = useRef(null);
  const imageRef    = useRef(null);
  const itemRefs    = useRef([]);
  const barRefs     = useRef([]);
  const tagRef      = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    // Always use animejs v3 module — pin with: npm install animejs@3.2.2
    const getAnime = () => {
      if (typeof window !== "undefined" && typeof window.anime === "function") {
        return Promise.resolve(window.anime);
      }
      return import("animejs").then((m) => {
        const anime = m.default ?? m;
        if (typeof anime === "function") return anime;
        // v4 fallback: wrap animate + attach stagger
        if (typeof m.animate === "function") {
          const a = (...args) => m.animate(...args);
          a.stagger = m.stagger;
          return a;
        }
        throw new Error("anime.js: no callable export found. Run: npm install animejs@3.2.2");
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;

          getAnime().then((anime) => {
            // Guard: ensure anime is callable
            if (typeof anime !== "function") {
              console.warn("anime.js not loaded correctly. Run: npm install animejs@3.2.2");
              return;
            }

            // ── Tag pill
            anime({
              targets: tagRef.current,
              opacity: [0, 1],
              translateY: [10, 0],
              duration: 600,
              easing: "easeOutExpo",
            });

            // ── Heading words — stagger
            const heading = textRef.current?.querySelector(".rk-heading");
            if (heading) {
              const words = heading.querySelectorAll(".rk-word");
              anime({
                targets: words,
                opacity: [0, 1],
                translateY: [24, 0],
                delay: anime.stagger(60, { start: 120 }),
                duration: 700,
                easing: "easeOutExpo",
              });
            }

            // ── Body copy
            anime({
              targets: textRef.current?.querySelector(".rk-body"),
              opacity: [0, 1],
              translateY: [16, 0],
              delay: 380,
              duration: 700,
              easing: "easeOutExpo",
            });

            // ── Feature rows
            anime({
              targets: itemRefs.current,
              opacity: [0, 1],
              translateX: [-20, 0],
              delay: anime.stagger(90, { start: 520 }),
              duration: 650,
              easing: "easeOutExpo",
            });

            // ── Progress bars
            barRefs.current.forEach((bar, i) => {
              if (!bar) return;
              anime({
                targets: bar,
                width: ["0%", bar.dataset.width + "%"],
                delay: 700 + i * 100,
                duration: 900,
                easing: "easeOutExpo",
              });
            });

            // ── CTA button
            anime({
              targets: textRef.current?.querySelector(".rk-cta"),
              opacity: [0, 1],
              translateY: [12, 0],
              delay: 880,
              duration: 600,
              easing: "easeOutExpo",
            });

            // ── Image card entrance
            anime({
              targets: imageRef.current,
              opacity: [0, 1],
              translateX: [40, 0],
              scale: [0.97, 1],
              delay: 200,
              duration: 1000,
              easing: "easeOutExpo",
            });

            // ── Image floating loop
            anime({
              targets: imageRef.current,
              translateY: [0, -10, 0],
              duration: 5000,
              delay: 1200,
              loop: true,
              easing: "easeInOutSine",
              direction: "alternate",
            });
          });

          observer.disconnect();
        }
      },
      { threshold: 0.18 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const barWidths = [82, 65, 74];

  return (
    <section
      ref={sectionRef}
      className="relative py-28 px-6 overflow-hidden bg-[#f7f8f5]"
    >
      {/* ── Subtle background grid ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(74,124,89,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(74,124,89,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* ── Glow orb ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(74,124,89,0.10) 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        {/* ══ LEFT — Copy ══ */}
        <div ref={textRef}>
          {/* Tag */}
          <div
            ref={tagRef}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-200 bg-emerald-50 mb-6"
            style={{ opacity: 0 }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-medium tracking-widest uppercase text-emerald-700">
              Rekle Dashboard
            </span>
          </div>

          {/* Heading — words wrapped for stagger */}
          <h2 className="rk-heading text-3xl md:text-4xl font-bold leading-tight text-slate-900 flex flex-wrap gap-x-[0.28em] gap-y-1">
            {["Lacak", "Dampakmu", "dengan"].map((w) => (
              <span key={w} className="rk-word inline-block" style={{ opacity: 0 }}>
                {w}
              </span>
            ))}
            <span
              className="rk-word inline-block text-emerald-600"
              style={{ opacity: 0 }}
            >
              Insight
            </span>
            <span
              className="rk-word inline-block text-emerald-600"
              style={{ opacity: 0 }}
            >
              Real-time
            </span>
          </h2>

          {/* Body */}
          <p
            className="rk-body mt-5 text-slate-500 leading-relaxed text-[15px]"
            style={{ opacity: 0 }}
          >
            Pantau perkembangan pengelolaan sampahmu, kumpulkan poin, dan lihat
            bagaimana kontribusimu terhadap lingkungan terus bertumbuh dari waktu
            ke waktu.
          </p>

          {/* Feature list */}
          <div className="mt-10 space-y-6">
            {features.map((f, i) => (
              <div
                key={i}
                ref={(el) => (itemRefs.current[i] = el)}
                className="flex items-start gap-4"
                style={{ opacity: 0 }}
              >
                {/* Icon box */}
                <div className="mt-0.5 shrink-0 w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  {f.icon}
                </div>

                {/* Text + bar */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-800 text-[14px]">
                    {f.title}
                  </h4>
                  <p className="text-[13px] text-slate-400 mt-0.5 leading-relaxed">
                    {f.desc}
                  </p>
                  {/* Animated progress bar */}
                  <div className="mt-2 h-0.5 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div
                      ref={(el) => (barRefs.current[i] = el)}
                      data-width={barWidths[i]}
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                      style={{ width: "0%" }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="rk-cta mt-10" style={{ opacity: 0 }}>
            <Link to="/action">
              <Button className="group relative rounded-full px-7 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium overflow-hidden transition-all duration-300 shadow-md hover:shadow-emerald-300/40 hover:shadow-lg">
                <span className="relative z-10 flex items-center gap-2">
                  Lihat Insight
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </Button>
            </Link>
          </div>
        </div>

        {/* ══ RIGHT — Dashboard image ══ */}
        <div className="relative flex items-center justify-center">
          {/* Decorative ring */}
          <div
            aria-hidden
            className="absolute inset-0 m-auto w-[90%] h-[90%] rounded-3xl"
            style={{
              background:
                "radial-gradient(ellipse at 50% 50%, rgba(74,124,89,0.12) 0%, transparent 70%)",
            }}
          />

          {/* Card glow */}
          <div
            aria-hidden
            className="absolute -inset-4 rounded-3xl opacity-30 blur-2xl"
            style={{
              background: "linear-gradient(135deg, #4a7c59, #7fff9e)",
            }}
          />

          {/* Image */}
          <div
            ref={imageRef}
            className="relative z-10 w-full"
            style={{ opacity: 0 }}
          >
            <img
              src={dashboardImg}
              alt="Rekle Dashboard Preview"
              className="w-full rounded-2xl shadow-2xl border border-white/60 ring-1 ring-emerald-900/10"
              style={{
                filter: "drop-shadow(0 20px 40px rgba(74,124,89,0.25))",
              }}
            />

            {/* Floating stat chip */}
            <div
              className="absolute -bottom-4 -left-4 flex items-center gap-2.5 bg-white rounded-xl px-4 py-2.5 shadow-lg border border-slate-100"
              style={{ backdropFilter: "blur(8px)" }}
            >
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-sm font-bold">
                ↑
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider leading-none mb-0.5">
                  Total Daur Ulang
                </p>
                <p className="text-sm font-bold text-slate-800">+24% minggu ini</p>
              </div>
            </div>

            {/* Floating badge chip */}
            <div
              className="absolute -top-4 -right-4 flex items-center gap-2 bg-emerald-600 text-white rounded-xl px-3.5 py-2 shadow-lg"
            >
              <span className="text-base">🏅</span>
              <span className="text-xs font-semibold">Badge Baru!</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPreviewSection;