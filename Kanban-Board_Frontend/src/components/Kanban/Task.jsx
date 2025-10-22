import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TbEdit } from "react-icons/tb";
import { FaTrash } from "react-icons/fa";
import { FaToggleOn, FaToggleOff } from "react-icons/fa6";

const Task = ({ task, onEdit, onDelete, onPreview, onToggleActive }) => {
  const { id, name, description, dueDate, isActive } = task;
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

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab rounded-xl border border-gray-700 ${isActive ? "bg-gray-800" : "bg-gray-750"} p-3 active:cursor-grabbing ${
        isDragging ? "opacity-50 shadow-lg" : ""
      }`}
    >
      <div className="flex flex-col gap-1" onClick={() => onPreview?.(task)}>
        <h4
          className={`font-semibold ${
            isActive ? "text-gray-200" : "text-red-400 line-through"
          }`}
        >
          {name}
        </h4>
        <p
          className={`text-sm ${
            isActive ? "text-gray-400" : "text-red-300 line-through"
          }`}
        >
          {description}
        </p>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span className={isActive ? "" : "line-through text-red-300"}>
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

        <div className="flex justify-end mt-2 gap-2">
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
            className="mt-2 text-blue-500 hover:text-blue-400 text-sm"
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
    </li>
  );
};

export default Task;
