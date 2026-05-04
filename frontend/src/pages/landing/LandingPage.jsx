import { CarouselSection } from "@/components/landing/CarouselSection";

function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-10 px-4">
      
      {/* TITLE */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold">
          Selamat Datang di REKLE
        </h1>
        <p className="text-muted-foreground max-w-md">
          Platform cerdas untuk membantu kamu mengelola keuangan dengan lebih mudah dan terstruktur.
        </p>
      </div>

      {/* CAROUSEL */}
      <CarouselSection />

    </div>
  );
}

export default LandingPage;