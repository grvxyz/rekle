import { useEffect, useState, useCallback } from "react";
import { Brain, TrendingUp, AlertTriangle, Flag, RefreshCw } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "@/lib/axios";
import dayjs from "dayjs";

// ── helpers ───────────────────────────────────────────────

function pct(v) {
  if (v == null) return "–";
  const n = v > 1 ? v : v * 100;
  return `${n.toFixed(1)}%`;
}

function confidenceTextColor(v) {
  if (v == null) return "#6b7280";
  const n = v > 1 ? v / 100 : v;
  if (n >= 0.9)  return "#15803d";
  if (n >= 0.75) return "#4d7c0f";
  if (n >= 0.6)  return "#92400e";
  return "#b91c1c";
}

function CategoryBadge({ label }) {
  const map = {
    organik:          { bg: "#d1fae5", color: "#065f46", border: "#6ee7b7" },
    plastik_pet:      { bg: "#dbeafe", color: "#1e3a8a", border: "#93c5fd" },
    plastik_hdpe:     { bg: "#dbeafe", color: "#1e3a8a", border: "#93c5fd" },
    plastik_campuran: { bg: "#dbeafe", color: "#1e3a8a", border: "#93c5fd" },
    kertas_bersih:    { bg: "#fef9c3", color: "#713f12", border: "#fde047" },
    kertas_kotor:     { bg: "#ffedd5", color: "#7c2d12", border: "#fdba74" },
    kaca_utuh:        { bg: "#cffafe", color: "#164e63", border: "#67e8f9" },
    kaca_pecah:       { bg: "#fee2e2", color: "#7f1d1d", border: "#fca5a5" },
  };
  const cfg = map[label] || { bg: "#f3f4f6", color: "#374151", border: "#d1d5db" };
  return (
    <span style={{
      background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.border}`,
      fontSize: 11, fontWeight: 500,
      padding: "2px 8px", borderRadius: 999, whiteSpace: "nowrap",
    }}>
      {label}
    </span>
  );
}

// ── stat card ─────────────────────────────────────────────

function StatCard({ icon: Icon, title, value, sub, subColor }) {
  return (
    <div style={{
      background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16,
      padding: "20px 24px", display: "flex", alignItems: "flex-start",
      justifyContent: "space-between", gap: 16, flex: 1, minWidth: 0,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 14, color: "#6b7280" }}>{title}</p>
        <p style={{ margin: "6px 0 4px", fontSize: 32, fontWeight: 700, color: "#111827", lineHeight: 1 }}>
          {value}
        </p>
        {sub && (
          <p style={{ margin: 0, fontSize: 13, color: subColor || "#16a34a", fontWeight: 500 }}>
            {sub}
          </p>
        )}
      </div>
      <div style={{
        width: 44, height: 44, borderRadius: 12, background: "#f0fdf4",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Icon size={20} color="#16a34a" />
      </div>
    </div>
  );
}

// ── skeleton ──────────────────────────────────────────────

function Skeleton({ w = "100%", h = 16, r = 8 }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: "#f3f4f6",
      animation: "pulse 1.5s ease-in-out infinite",
    }} />
  );
}

// ── main ──────────────────────────────────────────────────

const THRESHOLD = 0.7; // sesuai notebook: confidence_threshold = 0.7

const AIMonitoring = () => {
  const [scans,     setScans]     = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [flagged,   setFlagged]   = useState(new Set());

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [scanRes, tsRes] = await Promise.all([
        // FIX: pakai /admin/scans bukan /scan/history
        // /scan/history hanya return scan milik admin sendiri
        api.get("/admin/scans", { params: { skip: 0, limit: 200 } }),
        api.get("/admin/analytics/timeseries", {
          params: {
            start_date: dayjs().subtract(13, "day").format("YYYY-MM-DD"),
            end_date:   dayjs().format("YYYY-MM-DD"),
          },
        }),
      ]);

      // Response: { total, items: [...] }
      const items = Array.isArray(scanRes.data)
        ? scanRes.data
        : scanRes.data?.items || [];
      setScans(items);

      // Timeseries dari backend: [{ date, count }]
      // Backend tidak punya avg_confidence per hari, jadi chart
      // menampilkan jumlah scan per hari (bukan accuracy)
      const ts = Array.isArray(tsRes.data)
        ? tsRes.data.map((d) => ({
            date:  dayjs(d.date).format("D MMM"),
            count: d.count || 0,
          }))
        : [];
      setChartData(ts);

    } catch (err) {
      console.error(err);
      setError("Gagal mengambil data monitoring AI.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // derived stats
  const withConf = scans.filter((s) => s.confidence != null);
  const avgConf  = withConf.length
    ? withConf.reduce((a, s) => a + s.confidence, 0) / withConf.length
    : null;

  const confidentScans    = scans.filter((s) => s.is_confident === true);
  const notConfidentScans = scans.filter((s) => s.is_confident === false);

  // Scan dengan confidence di bawah threshold
  const lowConf = scans.filter(
    (s) => s.confidence != null && s.confidence < THRESHOLD
  );

  const handleFlag = (id) => {
    setFlagged((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", padding: "32px 24px" }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* header */}
        <div style={{
          marginBottom: 24, display: "flex", alignItems: "flex-start",
          justifyContent: "space-between", flexWrap: "wrap", gap: 12,
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "#111827" }}>
              AI Model Monitoring
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "#6b7280" }}>
              Monitor performa AI dan hasil prediksi klasifikasi sampah
            </p>
          </div>
          <button
            onClick={fetchData}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 16px", borderRadius: 10,
              border: "1px solid #d1d5db", background: "#fff",
              fontSize: 13, color: "#374151", cursor: "pointer", fontWeight: 500,
            }}
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        {/* error */}
        {error && (
          <div style={{
            background: "#fee2e2", color: "#7f1d1d",
            padding: "12px 16px", borderRadius: 12, marginBottom: 20, fontSize: 14,
          }}>
            {error}
          </div>
        )}

        {/* stat cards */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
          {loading ? (
            [0, 1, 2].map((i) => (
              <div key={i} style={{
                flex: 1, minWidth: 200, background: "#fff",
                border: "1px solid #e5e7eb", borderRadius: 16, padding: "20px 24px",
              }}>
                <Skeleton w="60%" h={14} />
                <div style={{ marginTop: 10 }}><Skeleton w="45%" h={32} /></div>
                <div style={{ marginTop: 8 }}><Skeleton w="55%" h={12} /></div>
              </div>
            ))
          ) : (
            <>
              <StatCard
                icon={Brain}
                title="Rata-rata Confidence"
                value={pct(avgConf)}
                sub={`Dari ${withConf.length} scan`}
              />
              <StatCard
                icon={TrendingUp}
                title="Scan Akurat (is_confident)"
                value={confidentScans.length}
                sub={`${scans.length > 0 ? ((confidentScans.length / scans.length) * 100).toFixed(1) : 0}% dari total scan`}
              />
              <StatCard
                icon={AlertTriangle}
                title="Confidence Rendah"
                value={lowConf.length}
                sub={`Threshold: < ${THRESHOLD * 100}%`}
                subColor="#dc2626"
              />
            </>
          )}
        </div>

        {/* chart — scan per hari */}
        <div style={{
          background: "#fff", border: "1px solid #e5e7eb",
          borderRadius: 16, padding: 24, marginBottom: 24,
        }}>
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#111827" }}>
              Jumlah Scan per Hari (14 Hari Terakhir)
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#9ca3af" }}>
              Data dari backend — /admin/analytics/timeseries
            </p>
          </div>
          {loading ? (
            <Skeleton w="100%" h={220} r={12} />
          ) : chartData.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af", fontSize: 14 }}>
              Belum ada data scan dalam 14 hari terakhir
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 13 }}
                  formatter={(v) => [v, "Jumlah Scan"]}
                />
                <Bar dataKey="count" fill="#16a34a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* low confidence table */}
        <div style={{
          background: "#fff", border: "1px solid #e5e7eb",
          borderRadius: 16, overflow: "hidden",
        }}>
          <div style={{
            padding: "20px 24px", display: "flex", alignItems: "center",
            justifyContent: "space-between", borderBottom: "1px solid #f3f4f6",
          }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#111827" }}>
              Prediksi Confidence Rendah
            </h2>
            <span style={{ fontSize: 13, color: "#6b7280" }}>
              Threshold: &lt; {THRESHOLD * 100}%
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  {["Kategori", "Confidence", "User ID", "Status AI", "Waktu", "Aksi"].map((h) => (
                    <th key={h} style={{
                      padding: "12px 20px", textAlign: "left",
                      fontSize: 13, color: "#6b7280", fontWeight: 500,
                      borderBottom: "1px solid #f3f4f6", whiteSpace: "nowrap",
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && [0, 1, 2].map((i) => (
                  <tr key={i}>
                    {[0, 1, 2, 3, 4, 5].map((j) => (
                      <td key={j} style={{ padding: "16px 20px" }}>
                        <Skeleton w="55%" h={14} />
                      </td>
                    ))}
                  </tr>
                ))}

                {!loading && lowConf.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{
                      padding: "40px 20px", textAlign: "center",
                      color: "#9ca3af", fontSize: 14,
                    }}>
                      Tidak ada prediksi dengan confidence rendah.
                    </td>
                  </tr>
                )}

                {!loading && lowConf.map((item) => {
                  const confPct  = item.confidence != null
                    ? `${(item.confidence * 100).toFixed(1)}%`
                    : "–";
                  const isFlagged = flagged.has(item.id);

                  return (
                    <tr
                      key={item.id}
                      style={{ borderBottom: "1px solid #f9fafb", transition: "background .15s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "14px 20px" }}>
                        <CategoryBadge label={item.result || "–"} />
                      </td>
                      <td style={{
                        padding: "14px 20px", fontWeight: 600,
                        color: confidenceTextColor(item.confidence),
                      }}>
                        {confPct}
                      </td>
                      <td style={{ padding: "14px 20px", color: "#111827", fontWeight: 500 }}>
                        #{item.user_id}
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        {item.is_confident ? (
                          <span style={{
                            fontSize: 12, fontWeight: 600,
                            color: "#16a34a", background: "#dcfce7",
                            padding: "2px 8px", borderRadius: 999,
                          }}>
                            Akurat
                          </span>
                        ) : (
                          <span style={{
                            fontSize: 12, fontWeight: 600,
                            color: "#b45309", background: "#fef3c7",
                            padding: "2px 8px", borderRadius: 999,
                          }}>
                            Kurang Yakin
                          </span>
                        )}
                      </td>
                      <td style={{
                        padding: "14px 20px", color: "#6b7280",
                        whiteSpace: "nowrap", fontSize: 13,
                      }}>
                        {item.created_at
                          ? dayjs(item.created_at).format("DD-MM-YYYY HH:mm:ss")
                          : "–"}
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <button
                          onClick={() => handleFlag(item.id)}
                          style={{
                            display: "flex", alignItems: "center", gap: 5,
                            background: "transparent", border: "none",
                            cursor: "pointer", fontSize: 13, fontWeight: 600,
                            color: isFlagged ? "#dc2626" : "#16a34a", padding: 0,
                          }}
                        >
                          <Flag size={14} />
                          {isFlagged ? "Flagged" : "Flag for Review"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* footer */}
          {!loading && (
            <div style={{
              padding: "12px 20px", borderTop: "1px solid #f3f4f6",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span style={{ fontSize: 12, color: "#9ca3af" }}>
                {lowConf.length} scan dengan confidence rendah terdeteksi
                {" · "}
                {notConfidentScans.length} scan tidak confident (gap/threshold gagal)
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#9ca3af", fontSize: 12 }}>
                <Brain size={13} />
                <span>MobileNetV2</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIMonitoring;