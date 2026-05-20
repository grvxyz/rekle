import dayjs from "dayjs";
import {
  ACTION_TYPE_LABEL,
  STATUS_CONFIG,
} from "./constants";

const ActionCard = ({
  action,
  onConfirm,
  onReject,
  isLoading,
}) => {
  const statusCfg =
    STATUS_CONFIG[action.status] ||
    STATUS_CONFIG.pending;

  return (
    <div className="bg-white rounded-2xl shadow p-5 space-y-4">

      {/* HEADER */}
      <div className="flex justify-between flex-wrap gap-4">

        <div className="space-y-2">

          <div className="flex items-center gap-2 flex-wrap">

            <h3 className="font-semibold text-gray-800">
              {ACTION_TYPE_LABEL[action.action_type] ||
                action.action_type}
            </h3>

            <span
              className={`px-2 py-1 text-xs rounded-full ${statusCfg.className}`}
            >
              {statusCfg.label}
            </span>

          </div>

          <div className="flex gap-4 text-sm text-gray-500 flex-wrap">

            <span>
              👤{" "}
              {action.user?.full_name ||
                action.user?.email ||
                `User #${action.user_id}`}
            </span>

            <span>
              🕒{" "}
              {dayjs(action.created_at).format(
                "DD MMM YYYY, HH:mm"
              )}
            </span>

            <span className="text-green-700 font-medium">
              +{action.points_earned} poin
            </span>

          </div>

        </div>

        {action.prediction_id && (
          <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
            Scan #{action.prediction_id}
          </span>
        )}
      </div>

      {/* NOTES */}
      {action.notes && (
        <div className="bg-gray-50 p-3 rounded-xl text-sm italic">
          "{action.notes}"
        </div>
      )}

      {/* IMAGE */}
      {action.proof_image_path && (
        <img
          src={action.proof_image_path}
          alt="proof"
          className="rounded-xl max-h-72 border"
        />
      )}

      {/* BUTTONS */}
      {action.status === "pending" && (
        <div className="flex gap-3 pt-2">

          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-2 bg-green-600 text-white rounded-xl"
          >
            {isLoading ? "..." : "✓ Konfirmasi"}
          </button>

          <button
            onClick={onReject}
            disabled={isLoading}
            className="flex-1 py-2 bg-red-100 text-red-600 rounded-xl"
          >
            {isLoading ? "..." : "✕ Tolak"}
          </button>

        </div>
      )}
    </div>
  );
};

export default ActionCard;