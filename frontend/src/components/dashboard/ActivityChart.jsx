import { Card, CardContent } from "../ui/card.jsx";
import SectionHeader from "../ui/SectionHeader.jsx";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function ActivityChart({ data }) {
  const chartData = Array.isArray(data) ? data : [];

  return (
    <Card className="h-full border-0 shadow-sm">
      <CardContent className="p-5">

        <SectionHeader
          title="Aktivitas Scan"
          subtitle="Frekuensi scan berdasarkan waktu"
        />

        <div className="h-64 mt-4">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line dataKey="total" />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </CardContent>
    </Card>
  );
}

export default ActivityChart;