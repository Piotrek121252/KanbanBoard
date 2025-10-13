import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import Task from "./Task";
import { FaCog } from "react-icons/fa";

const Column = ({
  id,
  title,
  items,
  boardId,
  onTaskEdit,
  onTaskDelete,
  onTaskPreview,
  onEdit,
}) => {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col rounded-xl border border-gray-700 bg-gray-800/70 p-3"
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-gray-200">{title}</h3>
        <button
          onClick={() => onEdit && onEdit({ id, title })}
          className="text-gray-400 hover:text-white transition"
          title="Edytuj kolumnę"
        >
          <FaCog size={18} />
        </button>
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
            />
          ))}
        </ul>
      </SortableContext>

      {items.length === 0 && (
        <div className="flex h-20 items-center justify-center rounded-md border border-dashed border-gray-600 bg-gray-800/30">
          <p className="text-sm text-gray-400">Drop tasks here</p>
        </div>
      )}
    </div>
  );
};

export default Column;
