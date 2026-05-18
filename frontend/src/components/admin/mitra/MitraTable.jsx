import dayjs from "dayjs";
import SkeletonTable from "@/components/admin/user/SkeletonTable";

// ─── Label tipe mitra ───────────────────────────────────────
const MITRA_TYPE_CONFIG = {
  bank_sampah: {
    label: "Bank Sampah",
    className: "bg-blue-100 text-blue-700",
  },
  daur_ulang: {
    label: "Daur Ulang",
    className: "bg-green-100 text-green-700",
  },
  eco_brick: {
    label: "Eco Brick",
    className: "bg-orange-100 text-orange-700",
  },
  kompos: {
    label: "Kompos",
    className: "bg-yellow-100 text-yellow-700",
  },
};

// ─── Komponen badge jenis sampah ───────────────────────────
const WasteBadges = ({ acceptedWaste }) => {
  if (!acceptedWaste) return <span className="text-gray-400 italic">-</span>;

  const list = acceptedWaste
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (list.length === 0)
    return <span className="text-gray-400 italic">-</span>;

  return (
    <div className="flex flex-wrap gap-1">
      {list.slice(0, 3).map((w) => (
        <span
          key={w}
          className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600"
        >
          {w.replace(/_/g, " ")}
        </span>
      ))}
      {list.length > 3 && (
        <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-400">
          +{list.length - 3} lainnya
        </span>
      )}
    </div>
  );
};

// ======================================================
// MITRA TABLE
// ======================================================

const MitraTable = ({
  mitras,
  loading,
  actionLoading,
  onToggleActive,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return <SkeletonTable rows={8} cols={7} />;
  }

  if (mitras.length === 0) {
    return (
      <div className="p-10 text-center text-gray-400">
        Tidak ada mitra ditemukan
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-500 text-left">
          <tr>
            <th className="px-4 py-3 font-medium">ID</th>
            <th className="px-4 py-3 font-medium">Nama</th>
            <th className="px-4 py-3 font-medium">Tipe</th>
            <th className="px-4 py-3 font-medium">Kota</th>
            <th className="px-4 py-3 font-medium">Jenis Sampah</th>
            <th className="px-4 py-3 font-medium">Kontak</th>
            <th className="px-4 py-3 font-medium">Terdaftar</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Aksi</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {mitras.map((mitra) => {
            const typeConfig =
              MITRA_TYPE_CONFIG[mitra.mitra_type] || {
                label: mitra.mitra_type,
                className: "bg-gray-100 text-gray-600",
              };

            return (
              <tr
                key={mitra.id}
                className="hover:bg-gray-50 transition-colors"
              >
                {/* ID */}
                <td className="px-4 py-3 text-gray-400">
                  #{mitra.id}
                </td>

                {/* Nama + deskripsi */}
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-800">
                    {mitra.name}
                  </p>
                  {mitra.description && (
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                      {mitra.description}
                    </p>
                  )}
                </td>

                {/* Tipe */}
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${typeConfig.className}`}
                  >
                    {typeConfig.label}
                  </span>
                </td>

                {/* Kota */}
                <td className="px-4 py-3 text-gray-600">
                  {mitra.city || (
                    <span className="text-gray-400 italic">-</span>
                  )}
                </td>

                {/* Jenis sampah */}
                <td className="px-4 py-3">
                  <WasteBadges acceptedWaste={mitra.accepted_waste} />
                </td>

                {/* Kontak */}
                <td className="px-4 py-3 text-gray-600">
                  <div className="space-y-0.5">
                    {mitra.phone && (
                      <p className="text-xs">{mitra.phone}</p>
                    )}
                    {mitra.email && (
                      <p className="text-xs text-blue-500 truncate max-w-35">
                        {mitra.email}
                      </p>
                    )}
                    {!mitra.phone && !mitra.email && (
                      <span className="text-gray-400 italic text-xs">-</span>
                    )}
                  </div>
                </td>

                {/* Terdaftar */}
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {mitra.created_at
                    ? dayjs(mitra.created_at).format("DD MMM YYYY")
                    : "-"}
                </td>

                {/* Status aktif */}
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      mitra.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {mitra.is_active ? "Aktif" : "Non-aktif"}
                  </span>
                </td>

                {/* Aksi */}
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {/* Edit */}
                    <button
                      onClick={() => onEdit(mitra)}
                      disabled={actionLoading === mitra.id}
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                    >
                      Edit
                    </button>

                    {/* Toggle aktif */}
                    <button
                      onClick={() => onToggleActive(mitra)}
                      disabled={actionLoading === mitra.id}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                        mitra.is_active
                          ? "bg-red-50 text-red-600 hover:bg-red-100"
                          : "bg-green-50 text-green-700 hover:bg-green-100"
                      }`}
                    >
                      {actionLoading === mitra.id
                        ? "..."
                        : mitra.is_active
                        ? "Nonaktifkan"
                        : "Aktifkan"}
                    </button>

                    {/* Hapus */}
                    <button
                      onClick={() => onDelete(mitra)}
                      disabled={actionLoading === mitra.id}
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
                    >
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default MitraTable;