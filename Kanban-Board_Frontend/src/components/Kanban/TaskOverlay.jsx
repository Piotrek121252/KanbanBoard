const TaskOverlay = ({ task }) => {
  const { name, description, dueDate, isActive } = task;
  if (!task) return null;

  return (
    <div className="cursor-grabbing rounded-xl border bg-gray-800 p-3 shadow-lg border-gray-700 w-64">
      <div className="flex flex-col gap-1">
        <h4 className="font-semibold text-gray-200">{name}</h4>
        <p className="text-gray-400 text-sm line-clamp-2">{description}</p>
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
    </div>
  );
};

export default TaskOverlay;
