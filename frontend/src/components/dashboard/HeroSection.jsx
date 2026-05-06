import { ArrowRight, ScanLine } from "lucide-react";
import Button from "../ui/button.jsx";
import { Card, CardContent } from "../ui/card.jsx";
import SectionHeader from "../ui/SectionHeader.jsx";

function HeroSection({ user, navigate }) {
  const firstName = user?.full_name?.split(" ")[0] || "User";

  return (
    <Card className="border-0 bg-green-900/80 text-white shadow-md">
      <CardContent className="p-6 space-y-4">

        <SectionHeader
          title={`Halo, ${firstName}!`}
          subtitle="Mulai kebiasaan baik dengan memilah sampah"
          className="text-white"
        />

        <div className="flex items-center justify-between flex-wrap gap-4">

          <div className="flex items-center gap-3 text-emerald-100/80 text-sm">
            <ScanLine className="w-5 h-5" />
            <span>Scan sampah untuk mendapatkan rekomendasi</span>
          </div>

          <Button
            onClick={() => navigate("/scan")}
            className="bg-emerald-100 text-green-950 hover:bg-emerald-900 hover:text-white flex items-center gap-2"
          >
            Mulai Scan
            <ArrowRight className="w-4 h-4" />
          </Button>

        </div>

      </CardContent>
    </Card>
  );
}

export default HeroSection;