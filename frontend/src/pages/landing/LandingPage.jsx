import CarouselSection from "@/components/landing/CarouselSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import MitraCTABanner from "@/components/landing/MitraCTABanner";
import DashboardPreviewSection from "@/components/landing/DashboardPreviewSection";
import CTASection from "@/components/landing/CTASection";

/**
 * LandingPage — Rekle
 *
 * SETUP: Tambahkan di <head> index.html:
 *   <link rel="preconnect" href="https://fonts.googleapis.com" />
 *   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
 *   <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
 *
 * DEPENDENCY: npm install animejs@3.2.2
 *
 * ROUTES Mitra (pastikan terdaftar di router):
 *   /mitra/register  → MitraRegister.jsx
 *   /mitra/login     → MitraLogin.jsx
 */

const LandingPage = () => {
  return (
    <>
      {/* Hero */}
      <CarouselSection />

      {/* Features */}
      <FeaturesSection />


      {/* How it works */}
      <HowItWorksSection />

      {/* Dashboard preview */}
      <DashboardPreviewSection />

      {/* Final CTA (user + mitra dual card) */}
      <CTASection />
    </>
  );
};

export default LandingPage;