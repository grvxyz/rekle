import { useEffect, useState, useCallback } from "react";
import api from "@/lib/axios";
import dayjs from "dayjs";


// ======================================================
// USER MANAGEMENT PAGE
// ======================================================

const UserManagement = () => {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [search, setSearch]     = useState("");
  const [page, setPage]         = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState(null); // id user yang sedang di-toggle

  const LIMIT = 20;


  // ======================================================
  // FETCH USERS
  // ======================================================

  const fetchUsers = useCallback(async () => {
    try {
      setError("");
      setLoading(true);

      const { data } = await api.get("/api/v1/admin/users", {
        params: {
          search: search || undefined,
          page,
          limit: LIMIT,
        },
      });

      // Backend diharapkan mengembalikan:
      // { users: [...], total: number, page: number, limit: number }
      setUsers(Array.isArray(data.users) ? data.users : []);
      setTotalPages(Math.ceil((data.total || 1) / LIMIT));

    } catch (err) {
      console.error("User fetch error:", err);

      if (err.response?.status === 403) {
        setError("Akses admin ditolak");
      } else {
        setError("Gagal mengambil data pengguna");
      }
    } finally {
      setLoading(false);
    }
  }, [search, page]);


  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);


  // Reset ke page 1 saat search berubah
  useEffect(() => {
    setPage(1);
  }, [search]);


  // ======================================================
  // TOGGLE AKTIF / NON-AKTIF
  // ======================================================

  const toggleActive = async (user) => {
    try {
      setActionLoading(user.id);

      await api.patch(`/api/v1/admin/users/${user.id}`, {
        is_active: !user.is_active,
      });

      // Update state lokal tanpa refetch
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, is_active: !u.is_active } : u
        )
      );
    } catch (err) {
      console.error("Toggle user error:", err);
      alert("Gagal mengubah status pengguna");
    } finally {
      setActionLoading(null);
    }
  };


  // ======================================================
  // PROMOTE / DEMOTE SUPERUSER
  // ======================================================

  const toggleSuperuser = async (user) => {
    const action = user.is_superuser ? "mencabut" : "memberikan";

    if (!confirm(`Yakin ingin ${action} akses admin untuk ${user.email}?`)) return;

    try {
      setActionLoading(user.id);

      await api.patch(`/api/v1/admin/users/${user.id}`, {
        is_superuser: !user.is_superuser,
      });

      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, is_superuser: !u.is_superuser } : u
        )
      );
    } catch (err) {
      console.error("Toggle superuser error:", err);
      alert("Gagal mengubah status admin pengguna");
    } finally {
      setActionLoading(null);
    }
  };


  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manajemen Pengguna</h1>

        <button
          onClick={fetchUsers}
          className="bg-black text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors"
        >
          Refresh
        </button>
      </div>


      {/* SEARCH */}
      <input
        type="text"
        placeholder="Cari nama atau email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
      />


      {/* ERROR */}
      {error && (
        <div className="bg-red-100 text-red-600 p-4 rounded-xl">
          {error}
        </div>
      )}


      {/* TABLE */}
      <div className="bg-white shadow rounded-2xl overflow-hidden">
        {loading ? (
          <SkeletonTable rows={8} cols={6} />
        ) : users.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            Tidak ada pengguna ditemukan
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">Nama</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Poin</th>
                  <th className="px-4 py-3 font-medium">Bergabung</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* ID */}
                    <td className="px-4 py-3 text-gray-400">
                      #{user.id}
                    </td>

                    {/* NAMA */}
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {user.full_name || (
                        <span className="text-gray-400 italic">-</span>
                      )}
                    </td>

                    {/* EMAIL */}
                    <td className="px-4 py-3 text-gray-600">
                      {user.email}
                    </td>

                    {/* POIN */}
                    <td className="px-4 py-3 font-mono">
                      {(user.total_points || 0).toLocaleString("id-ID")}
                    </td>

                    {/* BERGABUNG */}
                    <td className="px-4 py-3 text-gray-500">
                      {user.created_at
                        ? dayjs(user.created_at).format("DD MMM YYYY")
                        : "-"}
                    </td>

                    {/* STATUS */}
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          user.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {user.is_active ? "Aktif" : "Non-aktif"}
                      </span>
                    </td>

                    {/* ROLE */}
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          user.is_superuser
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {user.is_superuser ? "Admin" : "User"}
                      </span>
                    </td>

                    {/* AKSI */}
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {/* Toggle aktif */}
                        <button
                          onClick={() => toggleActive(user)}
                          disabled={actionLoading === user.id}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                            user.is_active
                              ? "bg-red-50 text-red-600 hover:bg-red-100"
                              : "bg-green-50 text-green-700 hover:bg-green-100"
                          } disabled:opacity-50`}
                        >
                          {actionLoading === user.id
                            ? "..."
                            : user.is_active
                            ? "Nonaktifkan"
                            : "Aktifkan"}
                        </button>

                        {/* Toggle admin */}
                        <button
                          onClick={() => toggleSuperuser(user)}
                          disabled={actionLoading === user.id}
                          className="px-3 py-1 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors disabled:opacity-50"
                        >
                          {user.is_superuser ? "Cabut Admin" : "Jadikan Admin"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>


      {/* PAGINATION */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl border text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            ← Prev
          </button>

          <span className="px-4 py-2 text-sm text-gray-600">
            {page} / {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-xl border text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};


// ======================================================
// SKELETON TABLE
// ======================================================

const SkeletonTable = ({ rows = 5, cols = 6 }) => (
  <div className="animate-pulse p-4 space-y-3">
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="flex gap-4">
        {[...Array(cols)].map((_, j) => (
          <div
            key={j}
            className="h-6 bg-gray-200 rounded flex-1"
            style={{ flexGrow: j === 2 ? 2 : 1 }}
          />
        ))}
      </div>
    ))}
  </div>
);


export default UserManagement;
