import { useNavigate } from "react-router-dom";
import { FaTrash, FaStar, FaRegStar } from "react-icons/fa";
import { IoPeopleSharp } from "react-icons/io5";

const BoardCard = ({ board, onDelete, onToggleFavorite, onEdit }) => {
  const navigate = useNavigate();

  return (
    <>
      <div
        className="relative p-4 border border-gray-700 rounded-xl shadow hover:shadow-lg cursor-pointer transition bg-gray-800 hover:bg-gray-700"
        onClick={() => navigate(`/boards/${board.id}/kanban`)}
      >
        <h2 className="text-lg font-medium text-gray-100">{board.name}</h2>
        <p className="text-gray-400 text-sm">
          {board.isPublic ? "Publiczna" : "Prywatna"} • Stworzona:{" "}
          {new Date(board.createdDate).toLocaleDateString()}
        </p>

        <p className="text-gray-300 text-sm mt-1">
          Członkowie: {board.members ? board.members.length : 0}
        </p>

        <div className="absolute top-2 right-2 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(board);
            }}
            className="text-yellow-400 hover:text-yellow-300"
            title={
              board.isFavorite ? "Usuń z ulubionych" : "Dodaj do ulubionych"
            }
          >
            {board.isFavorite ? <FaStar size={18} /> : <FaRegStar size={18} />}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(board);
            }}
            className="text-blue-400 hover:text-blue-300"
            title="Podgląd tablicy i członków"
          >
            <IoPeopleSharp size={18} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(board.id);
            }}
            className="text-gray-600 hover:text-red-500"
            title="Usuń tablicę"
          >
            <FaTrash size={18} />
          </button>
        </div>
      </div>
    </>
  );
};

export default BoardCard;
