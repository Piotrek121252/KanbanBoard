import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import Task from "./Task";
import { FaCog, FaArrowRight, FaArrowLeft } from "react-icons/fa";

const Column = ({
  id,
  title,
  items,
  boardId,
  onTaskEdit,
  onTaskDelete,
  onTaskPreview,
  onTaskToggleActive,
  onEdit,
  onMoveLeft,
  onMoveRight,
  isFirst,
  isLast,
}) => {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col rounded-xl border border-gray-700 bg-gray-800/70 p-3"
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-gray-200">{title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-gray-700 text-gray-100 rounded-full px-2 py-0.5">
            {items.length}
          </span>
          <button
            onClick={() => onMoveLeft && onMoveLeft(id, -1)}
            disabled={isFirst}
            className={`text-gray-400 hover:text-white transition ${isFirst ? "opacity-50 cursor-not-allowed" : ""}`}
            title="Przesuń w lewo"
          >
            <FaArrowLeft size={14} />
          </button>
          <button
            onClick={() => onMoveRight && onMoveRight(id, 1)}
            disabled={isLast}
            className={`text-gray-400 hover:text-white transition ${isLast ? "opacity-50 cursor-not-allowed" : ""}`}
            title="Przesuń w prawo"
          >
            <FaArrowRight size={14} />
          </button>
          <button
            onClick={() => onEdit && onEdit({ id, title })}
            className="text-gray-400 hover:text-white transition"
            title="Edytuj kolumnę"
          >
            <FaCog size={18} />
          </button>
        </div>
      </div>

      <SortableContext
        items={items.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul className="flex flex-col gap-2">
          {items.map((task) => (
            <Task
              key={task.id}
              task={task}
              onEdit={() => onTaskEdit(task)}
              onDelete={onTaskDelete}
              onPreview={onTaskPreview}
              onToggleActive={onTaskToggleActive}
            />
          ))}
        </ul>
      </SortableContext>

      {items.length === 0 && (
        <div className="flex h-20 items-center justify-center rounded-md border border-dashed border-gray-600 bg-gray-800/30">
          <p className="text-sm text-gray-400">Dodaj lub przenieś zadania</p>
        </div>
      )}
    </div>
  );
};

export default Column;
