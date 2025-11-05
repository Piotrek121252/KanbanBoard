import { FaTrash } from "react-icons/fa";

const roleColors = {
  ADMIN: "bg-red-600 text-white",
  EDITOR: "bg-yellow-600 text-white",
  VIEWER: "bg-gray-500 text-white",
};

const TaskComment = ({ comment, onDelete }) => {
  const getInitial = (name) => (name ? name[0].toUpperCase() : "?");

  return (
    <div className="flex justify-between items-start bg-gray-900 p-3 rounded-lg border border-gray-700 shadow-sm hover:bg-gray-800 transition">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center text-white font-bold text-sm">
          {getInitial(comment.username)}
        </div>

        <div className="flex flex-col gap-0.5">
          <p className="text-gray-100 font-semibold text-sm">
            {comment.username}{" "}
            {comment.boardRole && (
              <span
                className={`ml-1 px-1 py-0.5 rounded text-xs font-semibold ${roleColors[comment.boardRole]}`}
              >
                {comment.boardRole}
              </span>
            )}
          </p>
          <p className="text-gray-400 text-xs">
            {new Date(comment.createdDate).toLocaleString()}
          </p>
          <p className="text-gray-200 font-medium text-sm mt-1">
            {comment.comment}
          </p>
        </div>
      </div>

      {onDelete && (
        <button
          onClick={() => onDelete(comment.id)}
          className="ml-3 text-red-500 hover:text-red-400 transition"
          title="Usuń komentarz"
        >
          <FaTrash size={16} />
        </button>
      )}
    </div>
  );
};

export default TaskComment;
