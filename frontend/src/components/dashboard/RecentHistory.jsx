import { Card, CardContent } from "../ui/card.jsx";
import SectionHeader from "../ui/SectionHeader.jsx";

function RecentHistory({ history }) {
  return (
    <Card>
      <CardContent className="p-5">

        <SectionHeader
          title="Riwayat Terakhir"
          subtitle="Aktivitas scan terbaru"
        />

        <div className="mt-4 space-y-2 text-sm">
          {(history || []).slice(0, 5).map((item) => (
            <div
              key={item.id}
              className="flex justify-between border-b pb-2"
            >
              <span>{item.result}</span>
              <span className="text-gray-400">
                {new Date(item.created_at).toLocaleDateString("id-ID")}
              </span>
            </div>
          ))}
        </div>

      </CardContent>
    </Card>
  );
}

export default RecentHistory;