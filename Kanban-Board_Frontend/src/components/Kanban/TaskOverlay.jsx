import { FaToggleOn, FaToggleOff } from "react-icons/fa6";
import { TbEdit } from "react-icons/tb";
import { FaTrash } from "react-icons/fa";

const TaskOverlay = ({ task }) => {
  if (!task) return null;

  const { name, description, dueDate, isActive } = task;

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
            isActive ? "text-gray-200" : "text-red-400 line-through"
          }`}
        >
          {name}
        </h4>

        <p
          className={`text-sm line-clamp-2 ${
            isActive ? "text-gray-400" : "text-red-300 line-through"
          }`}
        >
          {description}
        </p>

        <div className="flex justify-between text-xs mt-1">
          <span
            className={`${
              isActive ? "text-gray-500" : "text-red-300 line-through"
            }`}
          >
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

        <div className="flex justify-end mt-2 gap-2 opacity-60">
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
  );
};

export default TaskOverlay;
