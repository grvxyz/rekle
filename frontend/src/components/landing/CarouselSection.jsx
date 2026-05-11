import Button from "../ui/button";
import { Link } from "react-router-dom";

const CarouselSection = () => {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
      
      {/*  
      <div className="absolute inset-0">
        <img
          src={null}
          alt="Nature background"
          className="w-full h-full object-cover"
        />
      </div>
      */}
      
      <div className="absolute inset-0 bg-gradient-to-b from-green-950/90 via-green-900/80 to-green-950/95"></div>
      <div className="relative z-10 text-center px-6 max-w-4xl">
        <p className="text-emerald-200 uppercase tracking-[0.3em] text-sm mb-6">
          Rekle 
        </p>
        <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
          Smarter Waste <br />
          <span className="text-emerald-300">Classification with AI</span>
        </h1>
        <p className="mt-6 text-lg text-emerald-100/80 max-w-2xl mx-auto">
          Pindai sampah Anda dan dapatkan rekomendasi ramah lingkungan secara instan. 
          Bergabunglah dalam revolusi pengelolaan sampah berkelanjutan.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/scan">
            <Button className="rounded-full px-8 py-3 text-lg">
              Mulai Scan
            </Button>
          </Link>
          
          <a href="#features">
            <Button
              variant="outline"
              className="rounded-full px-8 py-3 text-lg border-emerald-300 text-green-800 hover:bg-emerald-300 hover:text-black"
            >
              Pelajari Lebih Lanjut
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default CarouselSection;