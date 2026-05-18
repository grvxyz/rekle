import { useEffect, useState, useCallback } from "react";
import api from "@/lib/axios";

import UserTable from "@/components/admin/user/UserTable";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);

  const LIMIT = 20;

  // ======================================================
  // FETCH USERS
  // ======================================================
  const fetchUsers = useCallback(async () => {
    try {
      setError("");
      setLoading(true);

      const { data } = await api.get("/admin/users", {
        params: {
          search: search || undefined,
          page,
          limit: LIMIT,
        },
      });

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

  useEffect(() => {
    setPage(1);
  }, [search]);

  // ======================================================
  // TOGGLE AKTIF
  // ======================================================
  const toggleActive = async (user) => {
    try {
      setActionLoading(user.id);

      await api.patch(`/admin/users/${user.id}`, {
        is_active: !user.is_active,
      });

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
  // TOGGLE ADMIN
  // ======================================================
  const toggleSuperuser = async (user) => {
    const action = user.is_superuser ? "mencabut" : "memberikan";

    if (
      !confirm(
        `Yakin ingin ${action} akses admin untuk ${user.email}?`
      )
    )
      return;

    try {
      setActionLoading(user.id);

      await api.patch(`/admin/users/${user.id}`, {
        is_superuser: !user.is_superuser,
      });

      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? { ...u, is_superuser: !u.is_superuser }
            : u
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
        <h1 className="text-3xl font-bold">
          Manajemen Pengguna
        </h1>
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
        <UserTable
          users={users}
          loading={loading}
          actionLoading={actionLoading}
          toggleActive={toggleActive}
          toggleSuperuser={toggleSuperuser}
        />
      </div>

      {/* PAGINATION */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() =>
              setPage((p) => Math.max(1, p - 1))
            }
            disabled={page === 1}
            className="px-4 py-2 rounded-xl border text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            ← Prev
          </button>

          <span className="px-4 py-2 text-sm text-gray-600">
            {page} / {totalPages}
          </span>

          <button
            onClick={() =>
              setPage((p) =>
                Math.min(totalPages, p + 1)
              )
            }
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

export default UserManagement;