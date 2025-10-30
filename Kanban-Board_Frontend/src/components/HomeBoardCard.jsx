import { useNavigate } from "react-router-dom";

const HomeBoardCard = ({ board }) => {
  const navigate = useNavigate();

  return (
    <div
      className="p-4 border border-gray-700 rounded-xl shadow hover:shadow-lg cursor-pointer transition bg-gray-800 hover:bg-gray-700"
      onClick={() => navigate(`/boards/${board.id}/kanban`)}
    >
      <h2 className="text-lg font-medium text-gray-100">{board.name}</h2>
      <p className="text-gray-400 text-sm mt-1">
        {board.isPublic ? "Publiczna" : "Prywatna"} • Stworzona:{" "}
        {new Date(board.createdDate).toLocaleDateString()}
      </p>
      <p className="text-gray-300 text-sm mt-2">
        Członkowie: {board.members ? board.members.length : 0}
      </p>
    </div>
  );
};

export default HomeBoardCard;
