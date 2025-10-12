import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const Task = ({ id, content }) => {
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
      className={`cursor-grab rounded-xl border border-gray-700 bg-gray-800 p-3 active:cursor-grabbing ${
        isDragging ? "opacity-50 shadow-lg" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-gray-500">⋮</span>
        <span className="text-gray-200">{content}</span>
      </div>
    </li>
  );
};

export default Task;
