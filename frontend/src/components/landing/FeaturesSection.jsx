import SectionHeader from "@/components/ui/SectionHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Recycle, Gift, Target } from "lucide-react";

const features = [
  {
    Icon: Brain,
    title: "Deteksi AI",
    desc: "Model berbasis CNN canggih untuk klasifikasi jenis sampah secara akurat",
  },
  {
    Icon: Recycle,
    title: "Rekomendasi Cerdas",
    desc: "Dapatkan saran pembuangan ramah lingkungan yang dipersonalisasi sesuai kebutuhan Anda",
  },
  {
    Icon: Gift,
    title: "Sistem Reward",
    desc: "Kumpulkan poin dan raih berbagai badge sebagai apresiasi atas kontribusi Anda dalam menjaga lingkungan",
  },
  {
    Icon: Target,
    title: "Tantangan Ekologis",
    desc: "Selesaikan berbagai tantangan dan berkompetisi dengan pengguna lain demi gaya hidup yang lebih berkelanjutan",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        
        <SectionHeader
          title="Fitur Unggulan untuk Masa Depan yang Lebih Hijau"
          description="Semua yang Anda butuhkan untuk mengelola sampah secara berkelanjutan sekaligus mendapatkan berbagai reward"
          centered
        />

        <div className="mt-12 grid gap-8 md:grid-cols-4">
          {features.map((item, index) => (
            <Card
              key={index}
              className="
                group cursor-pointer
                rounded-2xl 
                border border-slate-200/60
                bg-white/70 backdrop-blur
                shadow-sm 
                transition-all duration-300 ease-in-out

                hover:-translate-y-2
                hover:shadow-xl
                hover:border-emerald-400/40
              "
            >
              <CardContent className="p-6 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="p-3 rounded-full bg-emerald-100 transition group-hover:scale-110">
                    <item.Icon className="w-6 h-6 text-emerald-600 group-hover:text-emerald-700 transition" />
                  </div>
                </div>

                <h3 className="text-xl font-semibold mb-2 group-hover:text-emerald-600 transition">
                  {item.title}
                </h3>

                <p className="text-muted-foreground text-sm">
                  {item.desc}
                </p>

              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
};

export default FeaturesSection;