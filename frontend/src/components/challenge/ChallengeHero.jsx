import { Trophy } from "lucide-react";
import { Card, CardContent } from "../ui/card.jsx";
import SectionHeader from "../ui/SectionHeader.jsx";

function ChallengeHero() {
  return (
    <Card className="border-0 bg-gradient-to-r from-emerald-900 to-green-800 text-white shadow-md">
      <CardContent className="p-6 space-y-4">

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-emerald-100" />
          </div>

          <SectionHeader
            title="Eco Challenges"
            subtitle="Selesaikan tantangan untuk mendapatkan poin tambahan"
            className="text-white"
          />
        </div>

      </CardContent>
    </Card>
  );
}

export default ChallengeHero;