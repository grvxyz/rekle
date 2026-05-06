import { Card, CardContent } from "../ui/card.jsx";
import SectionHeader from "../ui/SectionHeader.jsx";
import { Lightbulb } from "lucide-react";

function InsightCard({ user }) {
  return (
    <Card>
      <CardContent className="p-5 space-y-3">

        <SectionHeader
          title="Insight Kamu"
          subtitle="Ringkasan aktivitas pengguna"
        />

        <div className="flex items-start gap-3 text-sm text-gray-600">
          <Lightbulb className="w-5 h-5 text-emerald-300 mt-0.5" />
          <p>
            Kamu telah melakukan <b>{user.scan_count}</b> scan dan
            mengumpulkan <b>{user.total_points}</b> poin.
            Terus pertahankan kebiasaan baik ini.
          </p>
        </div>

      </CardContent>
    </Card>
  );
}

export default InsightCard;