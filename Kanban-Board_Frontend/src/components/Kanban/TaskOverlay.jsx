const TaskOverlay = ({ children }) => (
  <div className="cursor-grabbing rounded-xl border border-gray-700 bg-gray-800 p-3 shadow-lg">
    <div className="flex items-center gap-3">
      <span className="text-gray-500">⋮</span>
      <span className="text-gray-200">{children}</span>
    </div>
  </div>
);

export default TaskOverlay;
