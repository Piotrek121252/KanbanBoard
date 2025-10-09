import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const generateMockBoards = (count = 5) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Board ${i + 1}`,
    description: `This is a description for board ${i + 1}.`,
  }));
};

const BoardsPage = () => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const mockData = generateMockBoards(6);
      setBoards(mockData);
      setLoading(false);
    }, 800);
  }, []);

  if (loading)
    return <p className="p-6 pt-20 text-gray-300">Loading boards...</p>;

  return (
    <div className="p-6 pt-20 min-h-screen bg-gray-900 text-gray-100">
      <h1 className="text-2xl font-semibold mb-4">Your Boards</h1>

      {boards.length === 0 ? (
        <p>No boards found. Create one to get started!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {boards.map((board) => (
            <div
              key={board.id}
              className="p-4 border border-gray-700 rounded-xl shadow hover:shadow-lg cursor-pointer transition bg-gray-800 hover:bg-gray-700"
              onClick={() => navigate(`/board/${board.id}`)}
            >
              <h2 className="text-lg font-medium text-gray-100">
                {board.name}
              </h2>
              <p className="text-gray-400 text-sm">{board.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BoardsPage;
