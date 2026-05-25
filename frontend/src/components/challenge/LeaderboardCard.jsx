import { Card, CardContent } from "../ui/card.jsx";
import SectionHeader from "../ui/SectionHeader.jsx";
import { Trophy } from "lucide-react";

function LeaderboardCard({ users = [] }) {
  return (
    <Card>
      <CardContent className="p-5">

        <SectionHeader
          title="Leaderboard"
          subtitle="Top pengguna minggu ini"
        />

        <div className="mt-4 space-y-3">

          {users.map((user, index) => (
            <div
              key={user.id}
              className="flex items-center justify-between"
            >

              <div className="flex items-center gap-3">

                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-sm font-semibold text-emerald-700">
                  {index + 1}
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {user.name}
                  </p>
                </div>

              </div>

              <div className="flex items-center gap-1 text-amber-500">
                <Trophy className="w-4 h-4" />
                <span className="text-sm font-semibold">
                  {user.points}
                </span>
              </div>

            </div>
          ))}

        </div>

      </CardContent>
    </Card>
  );
}

export default LeaderboardCard;