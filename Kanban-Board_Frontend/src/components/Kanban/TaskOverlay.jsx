import { FaToggleOn, FaToggleOff } from "react-icons/fa6";
import { TbEdit } from "react-icons/tb";
import { FaTrash, FaExclamationTriangle } from "react-icons/fa";
import priorityMap from "../../constants/priorityMap";

const TaskOverlay = ({ task }) => {
  if (!task) return null;

  const { name, description, dueDate, isActive, priority } = task;
  const isOverdue =
    dueDate && new Date(dueDate).getTime() < Date.now() && isActive;

  const taskPriority = priorityMap[priority] || {
    color: "bg-gray-500",
    text: "Unknown",
  };

  return (
    <div
      className={`cursor-grabbing rounded-xl border p-3 shadow-lg w-64 transition-colors duration-200 ${
        isActive
          ? "bg-gray-800 border-gray-700"
          : "bg-gray-800/50 border-gray-600"
      }`}
    >
      <div className="flex flex-col gap-1">
        <h4
          className={`font-semibold ${
            !isActive ? "opacity-50 line-through" : ""
          }`}
        >
          {name}
        </h4>

        <p
          className={`text-sm text-gray-400 ${
            !isActive ? "opacity-50 line-through" : ""
          }`}
        >
          {description}
        </p>

        <div className="flex justify-between text-xs mt-1 items-center">
          <span
            className={`flex items-center gap-1 ${
              isActive
                ? isOverdue
                  ? "text-red-400 font-medium"
                  : "text-gray-500"
                : "text-gray-500 opacity-50 line-through"
            }`}
          >
            {isOverdue && <FaExclamationTriangle size={12} />}
            {dueDate
              ? new Date(dueDate).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
              : "Brak deadline"}
          </span>

          <span
            className={`font-medium ${
              isActive ? "text-green-400" : "text-red-400"
            }`}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
        </div>

        <div className="flex justify-between mt-2 items-center opacity-60">
          <span
            className={`inline-block px-2 py-1 text-xs font-semibold rounded ${taskPriority.color} text-white`}
            title={`Priority: ${taskPriority.text}`}
          >
            {taskPriority.text}
          </span>

          <div className="flex items-center gap-2">
            {isActive ? (
              <FaToggleOn size={18} className="text-green-400" />
            ) : (
              <FaToggleOff size={18} className="text-red-400" />
            )}
            <TbEdit size={18} className="text-blue-400" />
            <FaTrash size={14} className="text-red-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskOverlay;
