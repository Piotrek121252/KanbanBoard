import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const Task = ({ task, onClick }) => {
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
      className={`cursor-grab rounded-xl border border-gray-700 bg-gray-800 p-3 active:cursor-grabbing ${
        isDragging ? "opacity-50 shadow-lg" : ""
      }`}
      onClick={() => onClick(task)}
    >
      <div className="flex flex-col gap-1">
        <h4 className="font-semibold text-gray-200">{name}</h4>
        <p className="text-gray-400 text-sm">{description}</p>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>
            {dueDate
              ? new Date(dueDate).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
              : "Brak deadline"}
          </span>
          <span>{isActive ? "Active" : "Inactive"}</span>
        </div>
      </div>
    </li>
  );
};

export default Task;
