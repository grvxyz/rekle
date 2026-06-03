import {
  useEffect,
  useState,
  useMemo,
} from "react";

import {
  ArrowLeft,
  Brain,
  Recycle,
  Clock3,
  Filter,
  CheckCircle2,
  XCircle,
  Loader2,
  Trophy,
  X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import api from "@/lib/axios";
import { buildImageUrl } from "@/lib/imageURL";

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

import dayjs from "dayjs";

// ======================================================
// FILTERS
// ======================================================

const FILTERS = [
  {
    key: "all",
    label: "Semua",
  },
  {
    key: "scan",
    label: "Scan",
  },
  {
    key: "action",
    label: "Action",
  },
  {
    key: "approved",
    label: "Approved",
  },
  {
    key: "pending",
    label: "Pending",
  },
];

// ======================================================
// COMPONENT
// ======================================================

const HistoryPage = () => {

  const navigate =
    useNavigate();

  const [activities,
    setActivities] =
    useState([]);

  const [loading,
    setLoading] =
    useState(true);

  const [error,
    setError] =
    useState("");

  const [filter,
    setFilter] =
    useState("all");

  const [selectedActivity,
    setSelectedActivity] =
    useState(null);

  const [detailLoading,
    setDetailLoading] =
    useState(false);

  // ======================================================
  // FETCH
  // ======================================================

  useEffect(() => {

    const fetchHistory =
      async () => {

        try {

          setLoading(true);
          setError("");

          const response =
            await api.get(
              "/actions/activity"
            );

          setActivities(
            Array.isArray(response.data) ? response.data : (response.data?.items ?? [])
          );

        } catch (err) {

          console.error(err);

          setError(
            "Gagal mengambil riwayat aktivitas"
          );

        } finally {

          setLoading(false);

        }
      };

    fetchHistory();

  }, []);

  // ======================================================
  // FILTERED DATA
  // ======================================================

  const filteredActivities =
    useMemo(() => {

      switch (filter) {

        case "scan":
          return activities.filter(
            (item) =>
              item.type === "scan"
          );

        case "action":
          return activities.filter(
            (item) =>
              item.type === "action"
          );

        case "approved":
          return activities.filter(
            (item) =>
              item.status ===
              "approved"
          );

        case "pending":
          return activities.filter(
            (item) =>
              item.status ===
              "pending"
          );

        default:
          return activities;
      }

    }, [activities, filter]);

  // ======================================================
  // DETAIL
  // ======================================================

  const handleOpenDetail =
    async (item) => {

      try {

        setDetailLoading(true);

        const response =
          await api.get(
            `/actions/activity/${item.type}/${item.id}`
          );

        setSelectedActivity(
          response.data
        );

      } catch (err) {

        console.error(err);

      } finally {

        setDetailLoading(false);

      }
    };

  // ======================================================
  // HELPERS
  // ======================================================

  const getActivityIcon =
    (type) => {

      switch (type) {

        case "action":
          return Recycle;

        case "scan":
        default:
          return Brain;
      }
    };

  const getActivityColor =
    (type) => {

      switch (type) {

        case "action":
          return {
            bg: "bg-violet-50",
            text: "text-violet-700",
            badge:
              "bg-violet-50 text-violet-700",
          };

        case "scan":
        default:
          return {
            bg: "bg-emerald-50",
            text:
              "text-emerald-700",
            badge:
              "bg-emerald-50 text-emerald-700",
          };
      }
    };

  const getStatusBadge =
    (status) => {

      switch (status) {

        case "approved":
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">

              <CheckCircle2 className="w-3.5 h-3.5" />

              Approved

            </span>
          );

        case "pending":
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">

              <Loader2 className="w-3.5 h-3.5" />

              Pending

            </span>
          );

        case "rejected":
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">

              <XCircle className="w-3.5 h-3.5" />

              Rejected

            </span>
          );

        default:
          return null;
      }
    };

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <section className="min-h-screen bg-slate-50 py-10 px-6">

      <div className="max-w-4xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex items-center justify-between gap-4 flex-wrap">

          <div className="space-y-1">

            <button
              onClick={() =>
                navigate("/dashboard")
              }
              className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >

              <ArrowLeft className="w-4 h-4" />

              Kembali 

            </button>

            <h1 className="text-3xl font-bold text-slate-900">
              Riwayat Aktivitas
            </h1>

            <p className="text-sm text-slate-500">
              Semua scan dan action yang pernah dilakukan pengguna
            </p>

          </div>

          <div className="bg-white rounded-2xl border px-4 py-3 shadow-sm">

            <p className="text-xs text-slate-400">
              Total Aktivitas
            </p>

            <h2 className="text-2xl font-bold text-slate-900">
              {activities.length}
            </h2>

          </div>

        </div>

        {/* FILTER */}
        <div className="flex gap-2 overflow-x-auto pb-1">

          {FILTERS.map((item) => (

            <button
              key={item.key}
              onClick={() =>
                setFilter(item.key)
              }
              className={`px-4 py-2 rounded-2xl text-sm font-medium whitespace-nowrap transition-colors ${
                filter === item.key
                  ? "bg-emerald-600 text-white"
                  : "bg-white border text-slate-600 hover:bg-slate-50"
              }`}
            >

              {item.label}

            </button>

          ))}

        </div>

        {/* ERROR */}
        {error && (

          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm">

            {error}

          </div>

        )}

        {/* LOADING */}
        {loading ? (

          <div className="space-y-4 animate-pulse">

            {[...Array(5)].map(
              (_, i) => (

                <div
                  key={i}
                  className="bg-white rounded-2xl border p-5 space-y-3"
                >

                  <div className="h-4 bg-slate-200 rounded w-40" />

                  <div className="h-3 bg-slate-200 rounded w-64" />

                </div>
              )
            )}

          </div>

        ) : filteredActivities.length === 0 ? (

          <div className="bg-white rounded-3xl border p-12 text-center">

            <Filter className="w-10 h-10 text-slate-300 mx-auto" />

            <h2 className="mt-4 text-xl font-semibold text-slate-800">
              Tidak Ada Aktivitas
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Belum ada aktivitas yang sesuai dengan filter ini.
            </p>

          </div>

        ) : (

          <div className="space-y-4">

            {filteredActivities.map(
              (item, index) => {

                const Icon =
                  getActivityIcon(
                    item.type
                  );

                const colors =
                  getActivityColor(
                    item.type
                  );

                return (
                  <button
                    key={index}
                    onClick={() =>
                      handleOpenDetail(
                        item
                      )
                    }
                    className="relative w-full text-left flex gap-4 rounded-3xl border border-slate-200 bg-white p-5 transition-all hover:border-emerald-100 hover:shadow-sm hover:-translate-y-0.5"
                  >

                    {/* TIMELINE */}
                    {index !==
                      filteredActivities.length - 1 && (

                      <div className="absolute left-[35px] top-20 h-full w-px bg-slate-100" />

                    )}

                    {/* ICON */}
                    <div className={`relative z-10 w-12 h-12 rounded-2xl ${colors.bg} flex items-center justify-center shrink-0`}>

                      <Icon className={`w-5 h-5 ${colors.text}`} />

                    </div>

                    {/* CONTENT */}
                    <div className="flex-1 space-y-4 min-w-0">

                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">

                        <div className="space-y-2">

                          <div className="flex items-center gap-2 flex-wrap">

                            <h3 className="font-semibold text-slate-900">
                              {item.title}
                            </h3>

                            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${colors.badge}`}>

                              {item.type ===
                              "scan"
                                ? "Scan"
                                : "Action"}

                            </span>

                            {getStatusBadge(
                              item.status
                            )}

                          </div>

                          <p className="text-sm text-slate-600 leading-relaxed">

                            {item.description ||
                              "-"}

                          </p>
                        </div>

                        <div className="flex items-center gap-1 text-sm text-slate-400 shrink-0">
                          <Clock3 className="w-4 h-4" />
                          <span>
                            {dayjs(
                              item.created_at
                            ).format(
                              "DD MMM YYYY, HH:mm"
                            )}
                          </span>
                        </div>
                      </div>

                      {/* FOOTER */}
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className={`flex items-center gap-2 text-sm font-medium ${colors.text}`}>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>
                            {item.type ===
                            "scan"
                              ? "AI Scan Completed"
                              : "Action Submitted"}
                          </span>
                        </div>
                        {item.points_earned >
                          0 && (
                          <div className="flex items-center gap-1 text-amber-600 text-sm font-semibold">
                            <Trophy className="w-4 h-4" />
                            +{
                              item.points_earned
                            } poin
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              }
            )}
          </div>
        )}
      </div>

      {/* MODAL */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* HEADER */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Detail Aktivitas
                </h2>
                <p className="text-sm text-slate-500">
                  Informasi lengkap aktivitas pengguna
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedActivity(
                    null
                  )
                }
                className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* CONTENT */}
            <div className="p-6 space-y-6">
              {/* IMAGE */}
              {(selectedActivity.image_path ||
                selectedActivity.prediction?.image_path) && (
                <img
                  src={buildImageUrl(
                    selectedActivity.image_path ||
                    selectedActivity.prediction?.image_path
                  )}
                  alt="Activity"
                  className="w-full h-72 object-cover rounded-2xl border"
                />
              )}

              {/* AI */}
              <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-semibold text-emerald-900">
                    Hasil AI Scan
                  </h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      Kategori
                    </span>
                    <span className="font-semibold text-slate-800">
                      {selectedActivity.result ||
                        selectedActivity.prediction?.result ||
                        "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      Confidence
                    </span>
                    <span className="font-semibold text-slate-800">
                      {(
                        (
                          selectedActivity.confidence ||
                          selectedActivity.prediction?.confidence ||
                          0
                        ) * 100
                      ).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

      {/* ACTION */}
      {(selectedActivity.action ||
        selectedActivity.type === "action") && (
        <div className="space-y-4">

          {/* STATUS CARD */}
          <div
            className={`rounded-2xl border p-5 ${
              (
                selectedActivity.action?.status ||
                selectedActivity.status
              ) === "approved"
                ? "bg-emerald-50 border-emerald-100"
                : (
                    selectedActivity.action?.status ||
                    selectedActivity.status
                  ) === "rejected"
                ? "bg-red-50 border-red-100"
                : "bg-amber-50 border-amber-100"
            }`}
          >

            <div className="flex items-start justify-between gap-4">

              <div className="space-y-2">

                <h3 className="font-semibold text-slate-900">
                  Status Verifikasi
                </h3>

                {/* APPROVED */}
                {(
                  selectedActivity.action?.status ||
                  selectedActivity.status
                ) === "approved" && (

                  <div className="space-y-2">

                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">

                      <CheckCircle2 className="w-4 h-4" />

                      Action Approved

                    </div>

                    <p className="text-sm text-emerald-700 leading-relaxed">

                      Action berhasil diverifikasi admin.
                      Reward dan poin sudah ditambahkan ke akun pengguna.

                    </p>

                    {(
                      selectedActivity.verified_at
                    ) && (

                      <p className="text-xs text-emerald-600">

                        Diverifikasi pada{" "}
                        {dayjs(
                          selectedActivity.verified_at
                        ).format(
                          "DD MMM YYYY, HH:mm"
                        )}

                      </p>

                    )}

                  </div>

                )}

                {/* PENDING */}
                {(
                  selectedActivity.action?.status ||
                  selectedActivity.status
                ) === "pending" && (

                  <div className="space-y-2">

                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-sm font-medium">

                      <Loader2 className="w-4 h-4" />

                      Menunggu Verifikasi

                    </div>

                    <p className="text-sm text-amber-700 leading-relaxed">

                      Bukti action sedang direview admin.
                      Reward akan diberikan setelah proses verifikasi selesai.
                    </p>
                  </div>
                )}

                {/* REJECTED */}
                {(
                  selectedActivity.action?.status ||
                  selectedActivity.status
                ) === "rejected" && (

                  <div className="space-y-3">

                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 text-red-700 text-sm font-medium">
                      <XCircle className="w-4 h-4" />
                      Action Rejected
                    </div>

                    <p className="text-sm text-red-700 leading-relaxed">
                      Action belum dapat diverifikasi.
                      Periksa alasan penolakan berikut sebelum mengirim ulang bukti.
                    </p>

                    {selectedActivity.rejection_reason && (
                      <div className="bg-white border border-red-200 rounded-xl p-4">
                        <p className="text-xs font-medium text-red-500 uppercase tracking-wide mb-2">
                          Alasan Penolakan
                        </p>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {selectedActivity.rejection_reason}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ACTION DETAIL */}
          <div className="bg-violet-50 rounded-2xl border border-violet-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Recycle className="w-5 h-5 text-violet-600" />
              <h3 className="font-semibold text-violet-900">
                Detail Action
              </h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">
                  Jenis Action
                </p>
                <p className="font-semibold text-slate-800 capitalize mt-1">
                  {selectedActivity.action?.action_type ||
                    selectedActivity.action_type ||
                    "-"}
                </p>
              </div>

              <div>
                <p className="text-slate-500">
                  Route
                </p>
                <p className="font-semibold text-slate-800 capitalize mt-1">
                  {selectedActivity.action?.route ||
                    selectedActivity.route ||
                    "-"}
                </p>
              </div>

              <div>
                <p className="text-slate-500">
                  Reward Poin
                </p>
                <p className="font-semibold text-amber-600 mt-1 flex items-center gap-1">
                  <Trophy className="w-4 h-4" />
                  +{
                    selectedActivity.action?.points_earned ||
                    selectedActivity.points_earned ||
                    0
                  } poin
                </p>
              </div>

              <div>
                <p className="text-slate-500">
                  Saldo Reward
                </p>
                <p className="font-semibold text-emerald-600 mt-1">
                  Rp{" "}
                  {(
                    selectedActivity.balance_earned || 0
                  ).toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            {/* NOTES */}
            {(selectedActivity.notes ||
              selectedActivity.action?.notes) && (
              <div className="mt-5 pt-5 border-t border-violet-100">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                  Catatan User
                </p>
                <p className="text-sm text-slate-700 leading-relaxed">

                  {selectedActivity.notes ||
                    selectedActivity.action?.notes}
                </p>
              </div>
            )}
          </div>

          {/* PROOF IMAGE */}
          {(selectedActivity.proof_image_path ||
            selectedActivity.action?.proof_image_path) && (
            <div className="bg-slate-50 border rounded-2xl p-5 space-y-4">
              <div>
                <h3 className="font-semibold text-slate-900">
                  Bukti Action
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Foto bukti yang diunggah pengguna
                </p>
              </div>
              <img
                src={buildImageUrl(
                  selectedActivity.proof_image_path ||
                  selectedActivity.action?.proof_image_path
                )}
                alt="Proof"
                className="w-full h-72 object-cover rounded-2xl border"
              />
            </div>
          )}
        </div>
      )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default HistoryPage;