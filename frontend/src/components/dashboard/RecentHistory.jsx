import {
  Clock3,
  ScanLine,
  Brain,
  ChevronRight,
  Recycle,
  CheckCircle2,
  X,
  Trophy,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useState } from "react";

import api from "../../lib/axios.js";
import { buildImageUrl } from "../../lib/imageURL.js";

import {
  Card,
  CardContent,
} from "../ui/card.jsx";

function RecentHistory({
  history = [],
}) {

  const navigate = useNavigate();

  const [selectedActivity,
    setSelectedActivity] =
    useState(null);

  const [detailLoading,
    setDetailLoading] =
    useState(false);

  const formatDate = (
    dateString
  ) => {

    if (!dateString)
      return "-";

    return new Date(
      dateString
    ).toLocaleDateString(
      "id-ID",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getActivityIcon = (
    type
  ) => {

    switch (type) {

      case "action":
        return Recycle;

      case "scan":
      default:
        return Brain;
    }
  };

  const getActivityColor = (
    type
  ) => {

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
          text: "text-emerald-700",
          badge:
            "bg-emerald-50 text-emerald-700",
        };
    }
  };

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

        console.error(
          "Gagal ambil detail activity",
          err
        );

      } finally {

        setDetailLoading(false);

      }
    };

  return (
    <Card className="border-0 shadow-sm overflow-hidden">

      <CardContent className="p-6 space-y-6">

        {/* HEADER */}
        <div className="flex items-center justify-between">

          <div>

            <h2 className="text-xl font-bold text-gray-900">
              Aktivitas Terbaru
            </h2>

            <p className="text-sm text-gray-500">
              Riwayat scan dan aksi terbaru pengguna
            </p>

          </div>

          {/* LIHAT SEMUA */}
          <button
            onClick={() =>
              navigate("/history")
            }
            className="flex items-center gap-1 text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors"
          >

            Lihat Semua

            <ChevronRight className="w-4 h-4" />

          </button>

        </div>

        {/* EMPTY */}
        {history.length === 0 && (

          <div className="rounded-2xl border border-dashed border-gray-200 p-10 text-center">

            <div className="w-14 h-14 rounded-2xl bg-gray-100 mx-auto flex items-center justify-center">

              <ScanLine className="w-7 h-7 text-gray-400" />

            </div>

            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              Belum Ada Aktivitas
            </h3>

            <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
              Mulai scan dan lakukan aksi pengelolaan sampah
              untuk melihat riwayat aktivitas di dashboard.
            </p>

          </div>

        )}

        {/* TIMELINE */}
        <div className="space-y-4">

          {history
            .slice(0, 5)
            .map((item, index) => {

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
                  className="relative w-full text-left flex gap-4 rounded-2xl border border-gray-100 bg-white p-4 transition-all hover:border-emerald-100 hover:shadow-sm hover:-translate-y-0.5"
                >

                  {/* LINE */}
                  {index !==
                    history.length - 1 && (

                    <div className="absolute left-[31px] top-16 h-full w-px bg-gray-100" />

                  )}

                  {/* ICON */}
                  <div className={`relative z-10 w-11 h-11 rounded-2xl ${colors.bg} flex items-center justify-center shrink-0`}>

                    <Icon className={`w-5 h-5 ${colors.text}`} />

                  </div>

                  {/* CONTENT */}
                  <div className="flex-1 min-w-0 space-y-3">

                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">

                      <div className="space-y-1">

                        <div className="flex items-center gap-2 flex-wrap">

                          <h3 className="font-semibold text-gray-900">
                            {item.title}
                          </h3>

                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${colors.badge}`}>

                            {item.type ===
                            "scan"
                              ? "Scan"
                              : "Action"}

                          </span>

                        </div>

                        <p className="text-sm text-gray-600 leading-relaxed">

                          {item.description ||
                            "-"}

                        </p>

                      </div>

                      <div className="flex items-center gap-1 text-sm text-gray-400 shrink-0">

                        <Clock3 className="w-4 h-4" />

                        <span>

                          {formatDate(
                            item.created_at
                          )}

                        </span>

                      </div>

                    </div>

                    {/* FOOTER */}
                    <div className={`flex items-center gap-2 text-sm font-medium ${colors.text}`}>

                      <CheckCircle2 className="w-4 h-4" />

                      <span>

                        {item.type ===
                        "scan"
                          ? "AI Scan Completed"
                          : "Action Submitted"}

                      </span>

                      <ChevronRight className="w-4 h-4" />

                    </div>

                  </div>

                </button>
              );
            })}

        </div>

      </CardContent>

      {/* DETAIL MODAL */}
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

              {/* LOADING */}
              {detailLoading && (

                <div className="py-20 text-center text-slate-400">
                  Memuat detail...
                </div>

              )}

              {/* IMAGE */}
              {!detailLoading &&
                (
                  selectedActivity.image_path ||
                  selectedActivity.prediction?.image_path
                ) && (

                <img
                  src={buildImageUrl(
                    selectedActivity.image_path ||
                    selectedActivity.prediction?.image_path
                  )}
                  alt="Activity"
                  className="w-full h-72 object-cover rounded-2xl border"
                />

              )}

              {/* AI RESULT */}
              {!detailLoading && (

                <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">

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

                  {(selectedActivity.recommendation ||
                    selectedActivity.prediction?.recommendation) && (

                    <div className="mt-4 p-4 bg-white rounded-xl border text-sm text-slate-600 leading-relaxed">

                      {selectedActivity.recommendation ||
                        selectedActivity.prediction?.recommendation}

                    </div>

                  )}

                </div>

              )}

              {/* ACTION DETAIL */}
              {!detailLoading &&
                (
                  selectedActivity.action ||
                  selectedActivity.type === "action"
                ) && (

                <div className="bg-violet-50 rounded-2xl p-5 border border-violet-100">

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
                        Status
                      </p>

                      <p className="font-semibold text-slate-800 capitalize mt-1">

                        {selectedActivity.action?.status ||
                          selectedActivity.status ||
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
                        Reward
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

                  </div>

                </div>

              )}

            </div>

          </div>

        </div>

      )}

    </Card>
  );
}

export default RecentHistory;