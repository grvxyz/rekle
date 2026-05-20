import { useEffect, useState, useCallback } from "react";
import api from "@/lib/axios";

import ActionCard from "@/components/admin/konfirmasi/ActionCard";
import SkeletonCards from "@/components/admin/konfirmasi/SkeletonCards";

const KonfirmasiAksi = () => {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const fetchActions = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await api.get("/actions/pending");

      if (Array.isArray(data)) setActions(data);
      else if (Array.isArray(data.actions)) setActions(data.actions);
      else setActions([]);
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Silakan login terlebih dahulu");
      } else if (err.response?.status === 403) {
        setError("Akses admin ditolak");
      } else {
        setError("Gagal mengambil data aksi");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActions();
  }, [fetchActions]);

  const updateStatus = async (actionId, newStatus) => {
    const isApprove = newStatus === "confirmed";

    const confirmed = window.confirm(
      `Yakin ingin ${isApprove ? "mengonfirmasi" : "menolak"} aksi ini?`
    );

    if (!confirmed) return;

    try {
      setActionLoading(actionId);

      await api.patch(`/actions/${actionId}/verify`, {
        status: newStatus,
      });

      setActions((prev) =>
        prev.filter((a) => a.id !== actionId)
      );
    } catch (err) {
      alert("Gagal memproses aksi");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Konfirmasi Aksi
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Tinjau dan verifikasi aksi pengguna
          </p>
        </div>

      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-100 text-red-600 p-4 rounded-xl">
          {error}
        </div>
      )}

      {/* CONTENT */}
      {loading ? (
        <SkeletonCards count={5} />
      ) : actions.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-12 text-center text-gray-400">
          Tidak ada aksi yang menunggu konfirmasi
        </div>
      ) : (
        <div className="space-y-4">
          {actions.map((action) => (
            <ActionCard
              key={action.id}
              action={action}
              onConfirm={() =>
                updateStatus(action.id, "confirmed")
              }
              onReject={() =>
                updateStatus(action.id, "rejected")
              }
              isLoading={actionLoading === action.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default KonfirmasiAksi;