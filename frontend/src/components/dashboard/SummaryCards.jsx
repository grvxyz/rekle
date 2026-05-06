import { Card, CardContent } from "../ui/card.jsx";
import { ScanLine, Star, BarChart3 } from "lucide-react";

function SummaryCards({ user, favoriteCategory }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

      <Card>
        <CardContent className="p-5 flex items-center gap-3">
          <ScanLine className="w-5 h-5 text-green-800" />
          <div>
            <p className="text-xs text-gray-400">Total Scan</p>
            <h2 className="text-xl font-semibold">{user.scan_count}</h2>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 flex items-center gap-3">
          <Star className="w-5 h-5 text-emerald-300" />
          <div>
            <p className="text-xs text-gray-400">Poin</p>
            <h2 className="text-xl font-semibold">{user.total_points}</h2>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-green-800" />
          <div>
            <p className="text-xs text-gray-400">Kategori Favorit</p>
            <h2 className="text-sm font-semibold">
              {favoriteCategory || "-"}
            </h2>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}

export default SummaryCards;