import dayjs from "dayjs";
import SkeletonTable from "./SkeletonTable";

const UserTable = ({
  users,
  loading,
  actionLoading,
  toggleActive,
  toggleSuperuser,
}) => {
  if (loading) {
    return <SkeletonTable rows={8} cols={6} />;
  }

  if (users.length === 0) {
    return (
      <div className="p-10 text-center text-gray-400">
        Tidak ada pengguna ditemukan
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
            <th className="px-4 py-3 font-medium">Email</th>
            <th className="px-4 py-3 font-medium">Poin</th>
            <th className="px-4 py-3 font-medium">
              Bergabung
            </th>
            <th className="px-4 py-3 font-medium">
              Status
            </th>
            <th className="px-4 py-3 font-medium">
              Role
            </th>
            <th className="px-4 py-3 font-medium">
              Aksi
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {users.map((user) => (
            <tr
              key={user.id}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="px-4 py-3 text-gray-400">
                #{user.id}
              </td>

              <td className="px-4 py-3 font-medium text-gray-800">
                {user.full_name || (
                  <span className="text-gray-400 italic">
                    -
                  </span>
                )}
              </td>

              <td className="px-4 py-3 text-gray-600">
                {user.email}
              </td>

              <td className="px-4 py-3 font-mono">
                {(user.total_points || 0).toLocaleString(
                  "id-ID"
                )}
              </td>

              <td className="px-4 py-3 text-gray-500">
                {user.created_at
                  ? dayjs(user.created_at).format(
                      "DD MMM YYYY"
                    )
                  : "-"}
              </td>

              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    user.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {user.is_active
                    ? "Aktif"
                    : "Non-aktif"}
                </span>
              </td>

              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    user.is_superuser
                      ? "bg-purple-100 text-purple-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {user.is_superuser
                    ? "Admin"
                    : "User"}
                </span>
              </td>

              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      toggleActive(user)
                    }
                    disabled={
                      actionLoading === user.id
                    }
                    className={`px-3 py-1 rounded-lg text-xs font-medium ${
                      user.is_active
                        ? "bg-red-50 text-red-600"
                        : "bg-green-50 text-green-700"
                    }`}
                  >
                    {actionLoading === user.id
                      ? "..."
                      : user.is_active
                      ? "Nonaktifkan"
                      : "Aktifkan"}
                  </button>

                  <button
                    onClick={() =>
                      toggleSuperuser(user)
                    }
                    disabled={
                      actionLoading === user.id
                    }
                    className="px-3 py-1 rounded-lg text-xs font-medium bg-purple-50 text-purple-700"
                  >
                    {user.is_superuser
                      ? "Cabut Admin"
                      : "Jadikan Admin"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;