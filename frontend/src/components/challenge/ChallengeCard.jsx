
import { useNavigate } from "react-router-dom";

const TYPE_META = {
  scan:   { label: "Scan Sampah", icon: "📷", color: "bg-blue-50 text-blue-700 border-blue-200" },
  action: { label: "Aksi Nyata",  icon: "♻️", color: "bg-green-50 text-green-700 border-green-200" },
  points: { label: "Kumpul Poin", icon: "⭐", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
};

// FIX: tambah "draft" sesuai default status di model Content
const STATUS_META = {
  active:   { label: "Aktif",    color: "bg-emerald-100 text-emerald-700" },
  inactive: { label: "Nonaktif", color: "bg-gray-100 text-gray-500" },
  draft:    { label: "Draft",    color: "bg-orange-100 text-orange-600" },
  // "completed" bukan status dari backend — dihapus, karena status enum: draft|active|inactive
  // "selesai" ditentukan dari progress >= target, bukan dari field status
};

export default function ChallengeCard({ challenge }) {
  const navigate = useNavigate();

  const typeMeta   = TYPE_META[challenge.challenge_type]   ?? { label: challenge.challenge_type ?? "Challenge", icon: "🏆", color: "bg-purple-50 text-purple-700 border-purple-200" };
  const statusMeta = STATUS_META[challenge.status] ?? { label: challenge.status, color: "bg-gray-100 text-gray-500" };

  // FIX: `current` di-inject oleh ChallengePage via calculateChallengeProgress
  // field ini tidak ada di ContentResponse — parent wajib inject sebelum passing ke sini
  const progress = challenge.current ?? 0;
  const target   = challenge.target  ?? null; // nullable sesuai ContentBase
  const pct      = target ? Math.min(100, Math.round((progress / target) * 100)) : null;

  // FIX: `completed` juga di-inject oleh parent (bukan field dari backend)
  const isDone = challenge.completed || (pct !== null && pct >= 100);

  return (
    <div
      className={`
        relative bg-white rounded-2xl border shadow-sm overflow-hidden
        transition-all duration-200 hover:shadow-md hover:-translate-y-0.5
        ${isDone ? "border-emerald-300" : "border-gray-200"}
      `}
    >
      {/* Done ribbon */}
      {isDone && (
        <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          ✓ Selesai
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <span className="text-2xl leading-none mt-0.5">{typeMeta.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${typeMeta.color}`}>
                {typeMeta.label}
              </span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusMeta.color}`}>
                {statusMeta.label}
              </span>
            </div>
            {/* FIX: `title` wajib ada (nullable=false di ContentBase) */}
            <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">
              {challenge.title}
            </h3>
          </div>
        </div>

        {/* Description — nullable sesuai ContentBase */}
        {challenge.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3 ml-9">
            {challenge.description}
          </p>
        )}

        {/* Progress bar — hanya render jika target tidak null */}
        {target !== null && (
          <div className="ml-9 mb-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span className="font-medium">{progress} / {target}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${isDone ? "bg-emerald-500" : "bg-green-400"}`}
                style={{ width: `${pct ?? 0}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="ml-9 flex items-center justify-between">
          {/* FIX: reward_points default 0 sesuai ContentBase — tidak akan undefined */}
          <div className="flex items-center gap-1 text-amber-600">
            <span className="text-sm">⭐</span>
            <span className="text-sm font-bold">{challenge.reward_points ?? 0}</span>
            <span className="text-xs text-gray-400">poin</span>
          </div>

          <button
            onClick={() => navigate(`/challenge/${challenge.id}`)}
            className={`
              text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors
              ${isDone
                ? "bg-gray-100 text-gray-400 cursor-default"
                : "bg-green-600 text-white hover:bg-green-700"}
            `}
            disabled={isDone}
          >
            {isDone ? "Sudah Selesai" : "Lihat Detail →"}
          </button>
        </div>
      </div>
    </div>
  );
}