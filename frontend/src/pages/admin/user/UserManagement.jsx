import { useEffect, useState, useCallback } from "react";
import api from "@/lib/axios";
import UserTable from "@/components/admin/user/UserTable";

// ======================================================
// USER MANAGEMENT PAGE
// ======================================================

const LIMIT = 10;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const [actionLoading, setActionLoading] = useState(null);

  // ======================================================
  // DEBOUNCE SEARCH — tunggu 500ms lalu reset ke page 1
  // ======================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // ======================================================
  // FETCH USERS
  // ======================================================

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const skip = (page - 1) * LIMIT;

      const { data } = await api.get("/admin/users", {
        params: {
          skip,
          limit: LIMIT,
          search: debouncedSearch || undefined,
        },
      });

      if (Array.isArray(data)) {
        setUsers(data);
        setTotalUsers(data.length);
        setTotalPages(1);
      } else {
        setUsers(Array.isArray(data.users) ? data.users : []);
        setTotalUsers(data.total || 0);
        setTotalPages(Math.ceil((data.total || 1) / LIMIT));
      }
    } catch (err) {
      console.error("Fetch users error:", err);
      if (err.response?.status === 401) {
        setError("Silakan login terlebih dahulu");
      } else if (err.response?.status === 403) {
        setError("Akses admin ditolak");
      } else {
        setError("Gagal mengambil data pengguna");
      }
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ======================================================
  // TOGGLE ACTIVE
  // ======================================================

  const toggleActive = async (user) => {
    const action = user.is_active ? "menonaktifkan" : "mengaktifkan";
    if (!window.confirm(`Yakin ingin ${action} pengguna ini?`)) return;

    try {
      setActionLoading(user.id);
      await api.patch(`/admin/users/${user.id}/toggle-active`);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, is_active: !u.is_active } : u
        )
      );
    } catch (err) {
      console.error("Toggle active error:", err);
      alert("Gagal mengubah status pengguna");
    } finally {
      setActionLoading(null);
    }
  };

  // ======================================================
  // TOGGLE SUPERUSER
  // ======================================================

  const toggleSuperuser = async (user) => {
    const action = user.is_superuser ? "mencabut" : "memberikan";
    if (
      !window.confirm(
        `Yakin ingin ${action} akses admin untuk ${user.email}?`
      )
    )
      return;

    try {
      setActionLoading(user.id);
      await api.patch(`/admin/users/${user.id}/set-superuser`);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, is_superuser: !u.is_superuser } : u
        )
      );
    } catch (err) {
      console.error("Toggle superuser error:", err);
      alert("Gagal mengubah akses admin");
    } finally {
      setActionLoading(null);
    }
  };

  // ======================================================
  // ENTRY INFO
  // ======================================================

  const startEntry = totalUsers === 0 ? 0 : (page - 1) * LIMIT + 1;
  const endEntry = Math.min(page * LIMIT, totalUsers);

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="p-6 space-y-5">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-900">
              Manajemen Pengguna
            </h1>
            {!loading && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                {totalUsers.toLocaleString("id-ID")}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Kelola pengguna dan hak akses admin
          </p>
        </div>
      </div>

      {/* SEARCH */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <svg
            className="h-4 w-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Cari nama atau email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* ERROR */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl border border-red-100 text-sm">
          <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </div>
      )}

      {/* TABLE CARD */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        <UserTable
          users={users}
          loading={loading}
          actionLoading={actionLoading}
          toggleActive={toggleActive}
          toggleSuperuser={toggleSuperuser}
        />

        {/* PAGINATION FOOTER */}
        {!loading && totalUsers > 0 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50/50">
            {/* Entry info */}
            <p className="text-xs text-gray-400">
              Menampilkan{" "}
              <span className="font-semibold text-gray-600">{startEntry}–{endEntry}</span>
              {" "}dari{" "}
              <span className="font-semibold text-gray-600">
                {totalUsers.toLocaleString("id-ID")}
              </span>{" "}
              pengguna
            </p>

            {/* Pagination */}
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}

      </div>
    </div>
  );
};

// ======================================================
// PAGINATION COMPONENT
// ======================================================

const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  // Generate page numbers with ellipsis
  const getPages = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = [1];
    if (page > 3) pages.push("...");
    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(totalPages - 1, page + 1);
      i++
    ) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  // Base classes
  const base =
    "inline-flex items-center justify-center min-w-[32px] h-8 px-1 rounded-lg text-xs font-medium border transition-all duration-150 select-none";
  const inactive =
    "bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-800 hover:border-gray-300 cursor-pointer";
  const active =
    "bg-green-600 text-white border-green-600 shadow-sm cursor-default";
  const disabled =
    "bg-white text-gray-300 border-gray-100 cursor-not-allowed";

  return (
    <nav className="flex items-center gap-1" aria-label="Pagination">

      {/* First page */}
      <button
        onClick={() => onPageChange(1)}
        disabled={page === 1}
        aria-label="Halaman pertama"
        className={`${base} ${page === 1 ? disabled : inactive}`}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7M18 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Previous */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label="Sebelumnya"
        className={`${base} ${page === 1 ? disabled : inactive}`}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Page numbers */}
      {getPages().map((p, idx) =>
        p === "..." ? (
          <span
            key={`ellipsis-${idx}`}
            className="inline-flex items-center justify-center w-8 h-8 text-xs text-gray-400 select-none"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => p !== page && onPageChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={`${base} ${p === page ? active : inactive}`}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Berikutnya"
        className={`${base} ${page === totalPages ? disabled : inactive}`}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Last page */}
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={page === totalPages}
        aria-label="Halaman terakhir"
        className={`${base} ${page === totalPages ? disabled : inactive}`}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M6 5l7 7-7 7" />
        </svg>
      </button>

    </nav>
  );
};

export default UserManagement;