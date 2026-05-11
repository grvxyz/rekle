import Button from "@/components/ui/button";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-24 px-6 bg-slate-100">
      <div className="max-w-4xl mx-auto text-center">
        
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
          Siap Membuat Perubahan?
        </h2>

        <p className="mt-4 text-slate-600 text-lg">
          Bergabunglah dengan ribuan pengguna yang telah menjadikan pengelolaan
          sampah lebih cerdas dan berkelanjutan.
        </p>

        <div className="mt-8">
          <Link to="/scan">
            <Button
              className="
                bg-emerald-600 text-white
                hover:bg-emerald-700
                rounded-full 
                px-8 py-3 text-lg
                transition
                hover:scale-105
                shadow-md
              "
            >
              Mulai Scan Sekarang
            </Button>
          </Link>
        </div>

      </div>
    </section>
  );
};

export default CTASection;