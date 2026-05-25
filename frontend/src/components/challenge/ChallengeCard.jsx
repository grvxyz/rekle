import { Card, CardContent } from "../ui/card.jsx";
import Button from "../ui/button.jsx";
import {
  ScanLine,
  Recycle,
  Leaf,
  CheckCircle2,
} from "lucide-react";

const iconMap = {
  scan: ScanLine,
  recycle: Recycle,
  reuse: Leaf,
};

function ChallengeCard({ challenge }) {
  const Icon = iconMap[challenge.type] || ScanLine;

  const progress =
    Math.min(
      (challenge.current / challenge.target) * 100,
      100
    ) || 0;

  return (
    <Card>
      <CardContent className="p-5 space-y-4">

        <div className="flex items-start justify-between gap-4">

          <div className="flex items-start gap-3">

            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Icon className="w-5 h-5 text-emerald-700" />
            </div>

            <div>
              <h3 className="font-semibold text-gray-800">
                {challenge.title}
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                {challenge.description}
              </p>
            </div>

          </div>

          <span className="text-sm font-semibold text-emerald-700">
            +{challenge.reward}
          </span>

        </div>

        {/* Progress */}
        <div className="space-y-2">

          <div className="flex justify-between text-xs text-gray-400">
            <span>Progress</span>
            <span>
              {challenge.current}/{challenge.target}
            </span>
          </div>

          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2">

          <span className="text-xs text-gray-400">
            {challenge.deadline}
          </span>

          {progress >= 100 ? (
            <div className="flex items-center gap-1 text-sm text-emerald-600 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Selesai
            </div>
          ) : (
            <Button size="sm">
              Lanjutkan
            </Button>
          )}

        </div>

      </CardContent>
    </Card>
  );
}

export default ChallengeCard;