import dayjs from "dayjs";
import SkeletonTable from "./SkeletonTable";

// ======================================================
// USER TABLE COMPONENT
// ======================================================

const UserTable = ({
  users,
  loading,
  actionLoading,
  toggleActive,
  toggleSuperuser,
}) => {
  if (loading) {
    return <SkeletonTable rows={10} cols={8} />;
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <svg
          className="w-12 h-12 mb-3 opacity-30"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <p className="text-sm font-medium text-gray-500">
          Tidak ada pengguna ditemukan
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Coba ubah kata kunci pencarian
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[900px]">

        {/* HEAD */}
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider w-16">
              ID
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Nama
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Email
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider w-28">
              Poin
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider w-32">
              Bergabung
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider w-24">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider w-24">
              Role
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider w-44">
              Aksi
            </th>
          </tr>
        </thead>

        {/* BODY */}
        <tbody className="divide-y divide-gray-50">
          {users.map((user) => {
            const isActioning = actionLoading === user.id;

            return (
              <tr
                key={user.id}
                className="hover:bg-gray-50/70 transition-colors duration-100 group"
              >
                {/* ID */}
                <td className="px-4 py-3.5">
                  <span className="text-xs font-mono text-gray-300 group-hover:text-gray-400 transition-colors">
                    #{user.id}
                  </span>
                </td>

                {/* NAMA */}
                <td className="px-4 py-3.5">
                  {user.full_name ? (
                    <span className="font-medium text-gray-800">
                      {user.full_name}
                    </span>
                  ) : (
                    <span className="text-gray-300 italic text-xs">
                      Tidak ada nama
                    </span>
                  )}
                </td>

                {/* EMAIL */}
                <td className="px-4 py-3.5">
                  <span className="text-gray-500 text-xs">
                    {user.email}
                  </span>
                </td>

                {/* POIN */}
                <td className="px-4 py-3.5 text-right">
                  <span className="font-mono text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md">
                    {(user.total_points || 0).toLocaleString("id-ID")}
                  </span>
                </td>

                {/* BERGABUNG */}
                <td className="px-4 py-3.5">
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {user.created_at
                      ? dayjs(user.created_at).format("DD MMM YYYY")
                      : "—"}
                  </span>
                </td>

                {/* STATUS */}
                <td className="px-4 py-3.5">
                  {user.is_active ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                      Aktif
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-500 border border-red-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                      Non-aktif
                    </span>
                  )}
                </td>

                {/* ROLE */}
                <td className="px-4 py-3.5">
                  {user.is_superuser ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-100">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                      User
                    </span>
                  )}
                </td>

                {/* AKSI */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-end gap-1.5">

                    {/* Toggle Active */}
                    <button
                      onClick={() => toggleActive(user)}
                      disabled={isActioning}
                      className={`
                        inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium
                        border transition-all duration-150
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${
                          user.is_active
                            ? "border-red-100 text-red-500 bg-red-50 hover:bg-red-100 hover:border-red-200"
                            : "border-green-100 text-green-600 bg-green-50 hover:bg-green-100 hover:border-green-200"
                        }
                      `}
                    >
                      {isActioning ? (
                        <SpinnerIcon />
                      ) : user.is_active ? (
                        <BanIcon />
                      ) : (
                        <CheckIcon />
                      )}
                      {user.is_active ? "Nonaktifkan" : "Aktifkan"}
                    </button>

                    {/* Toggle Superuser */}
                    <button
                      onClick={() => toggleSuperuser(user)}
                      disabled={isActioning}
                      className={`
                        inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium
                        border transition-all duration-150
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${
                          user.is_superuser
                            ? "border-amber-100 text-amber-600 bg-amber-50 hover:bg-amber-100 hover:border-amber-200"
                            : "border-violet-100 text-violet-600 bg-violet-50 hover:bg-violet-100 hover:border-violet-200"
                        }
                      `}
                    >
                      {user.is_superuser ? <ShieldOffIcon /> : <ShieldIcon />}
                      {user.is_superuser ? "Cabut Admin" : "Jadikan Admin"}
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

// ======================================================
// ICON HELPERS
// ======================================================

const SpinnerIcon = () => (
  <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const BanIcon = () => (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const ShieldOffIcon = () => (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01" />
  </svg>
);

export default UserTable;