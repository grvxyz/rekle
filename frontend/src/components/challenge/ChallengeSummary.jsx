import { Card, CardContent } from "../ui/card.jsx";
import { Trophy, CheckCircle2, Star } from "lucide-react";

function ChallengeSummary({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

      <Card>
        <CardContent className="p-5 flex items-center gap-3">
          <Trophy className="w-5 h-5 text-emerald-600" />
          <div>
            <p className="text-xs text-gray-400">Challenge Aktif</p>
            <h2 className="text-xl font-semibold">
              {stats.active}
            </h2>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-blue-500" />
          <div>
            <p className="text-xs text-gray-400">Selesai</p>
            <h2 className="text-xl font-semibold">
              {stats.completed}
            </h2>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 flex items-center gap-3">
          <Star className="w-5 h-5 text-amber-500" />
          <div>
            <p className="text-xs text-gray-400">Reward Poin</p>
            <h2 className="text-xl font-semibold">
              {stats.points}
            </h2>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}

export default ChallengeSummary;