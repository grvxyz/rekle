import Button from "@/components/ui/button";
import dashboardImg from "@/assets/dashboard.jpg"; 

const DashboardPreviewSection = () => {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold leading-tight">
            Lacak Dampakmu dengan{" "}
            <span className="text-emerald-600">Insight Real-time</span>
          </h2>

          <p className="mt-4 text-slate-600">
            Pantau perkembangan pengelolaan sampahmu, kumpulkan poin, dan lihat
            bagaimana kontribusimu terhadap lingkungan terus bertumbuh dari waktu ke waktu.
          </p>

          <div className="mt-8 space-y-5">
            
            <div>
              <h4 className="font-semibold">Analitik Mingguan & Bulanan</h4>
              <p className="text-sm text-slate-500">
                Pantau tren klasifikasi sampahmu secara berkala
              </p>
            </div>

            <div>
              <h4 className="font-semibold">Badge Pencapaian</h4>
              <p className="text-sm text-slate-500">
                Buka berbagai badge saat kamu mencapai milestone baru
              </p>
            </div>

            <div>
              <h4 className="font-semibold">Tips & Rekomendasi Ramah Lingkungan</h4>
              <p className="text-sm text-slate-500">
                Dapatkan tips personal untuk meningkatkan gaya hidup berkelanjutan
              </p>
            </div>

          </div>

          <div className="mt-8">
            <Button className="rounded-full px-6">
              Lihat Insight
            </Button>
          </div>
        </div>

        <div className="relative">
          <img
            src={dashboardImg}
            alt="Dashboard Preview"
            className="
              w-full 
              rounded-2xl 
              shadow-xl 
              border border-slate-200
            "
          />
        </div>

      </div>
    </section>
  );
};

export default DashboardPreviewSection;