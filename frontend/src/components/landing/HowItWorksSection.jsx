import SectionHeader from "@/components/ui/SectionHeader";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    number: "01",
    title: "Unggah Gambar Sampah",
    desc: "Ambil foto atau unggah gambar sampah Anda",
  },
  {
    number: "02",
    title: "AI Menganalisis",
    desc: "Model AI kami mengklasifikasikan jenis sampah dengan akurasi tinggi",
  },
  {
    number: "03",
    title: "Dapatkan Rekomendasi",
    desc: "Terima saran pembuangan yang cerdas sekaligus kumpulkan reward",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-20 px-6 max-w-6xl mx-auto">
      
      <SectionHeader
        title="Cara Kerjanya"
        description="Mulai klasifikasi sampah hanya dalam tiga langkah sederhana"
        centered
      />

      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {steps.map((step, index) => (
          <Card
            key={index}
            className="
              group cursor-pointer
              rounded-2xl 
              border border-slate-200/60
              bg-white
              shadow-sm
              transition-all duration-300

              hover:shadow-[0_10px_30px_rgba(16,185,129,0.2)]
              hover:border-emerald-400
            "
          >
            <CardContent className="p-8 text-center">
              
              <div className="text-emerald-500 font-bold text-lg mb-2">
                {step.number}
              </div>

              <h3 className="text-xl font-semibold mb-3 group-hover:text-emerald-600 transition">
                {step.title}
              </h3>

              <p className="text-muted-foreground text-sm">
                {step.desc}
              </p>

            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default HowItWorksSection;