import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TbEdit } from "react-icons/tb";
import { FaTrash, FaExclamationTriangle } from "react-icons/fa";
import { FaToggleOn, FaToggleOff } from "react-icons/fa6";
import priorityMap from "../../constants/PriorityMap";

const Task = ({ task, onEdit, onDelete, onPreview, onToggleActive }) => {
  const { id, name, description, dueDate, isActive, priority } = task;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isOverdue =
    dueDate && new Date(dueDate).getTime() < Date.now() && isActive;

  const taskPriority = priorityMap[priority] || {
    color: "bg-gray-500",
    text: "Unknown",
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab rounded-xl border p-3 active:cursor-grabbing transition-colors duration-200 ${
        isDragging ? "opacity-50 shadow-lg" : ""
      } ${
        isActive
          ? "bg-gray-800 border-gray-700"
          : "bg-gray-800/50 border-gray-600"
      }`}
    >
      <div className="flex flex-col gap-1" onClick={() => onPreview?.(task)}>
        <h4
          className={`font-semibold text-gray-200 ${
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

        <div className="flex justify-between mt-2 items-center">
          <span
            className={`inline-block px-2 py-1 text-xs font-semibold rounded ${taskPriority.color} text-white select-none`}
            title={`Priority: ${taskPriority.text}`}
          >
            {taskPriority.text}
          </span>

          <div className="flex items-center gap-2">
            <div className="text-[10px] text-yellow-400 mt-1">
              Position: {task.position ?? "N/A"}
            </div>

            <button
              type="button"
              className={`transition ${
                isActive
                  ? "text-green-400 hover:text-green-300"
                  : "text-red-400 hover:text-red-300"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleActive?.(task);
              }}
              title={isActive ? "Dezaktywuj zadanie" : "Aktywuj zadanie"}
            >
              {isActive ? <FaToggleOn size={20} /> : <FaToggleOff size={20} />}
            </button>

            <button
              type="button"
              className="text-blue-500 hover:text-blue-400"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
              title="Edytuj zadanie"
            >
              <TbEdit size={20} />
            </button>

            <button
              type="button"
              className="text-red-500 hover:text-red-400"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id, task.columnId);
              }}
              title="Usuń zadanie"
            >
              <FaTrash size={16} />
            </button>
          </div>
        </div>
      </div>
    </li>
  );
};

export default Task;
