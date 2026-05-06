import Navbar from "@/components/layout/Navbar";
import CarouselSection from "@/components/landing/CarouselSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import DashboardPreviewSection from "@/components/landing/DashboardPreviewSection";
import CTASection from "@/components/landing/CTASection";

const LandingPage = () => {
  return (
    <>
      <CarouselSection />
      <FeaturesSection />
      <HowItWorksSection />
      <DashboardPreviewSection />
      <CTASection />
      
    </>
  );
};

export default LandingPage;