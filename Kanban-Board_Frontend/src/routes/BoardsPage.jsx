import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Modal from "../components/Modal";
import BoardEditModal from "../components/BoardsPage/BoardEditModal";
import BoardCard from "../components/BoardsPage/BoardCard";
import useAuth from "../hooks/useAuth";
import { Link } from "react-router-dom";
import { FaLock, FaGlobe } from "react-icons/fa";

const BoardsPage = () => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { token, username } = useAuth();

  const fetchBoards = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8080/api/boards", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBoards(response.data);
    } catch (err) {
      console.error("Nie udało się pobrać tablic:", err);
      setBoards([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  if (!token || !username) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 px-6">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-10 text-center max-w-md w-full">
          <h2 className="text-3xl font-bold text-white mb-4">
            Nie jesteś zalogowany
          </h2>
          <p className="mb-6 text-gray-400 text-lg">
            Zaloguj się, aby zobaczyć swoje tablice i kontynuować pracę nad
            projektami.
          </p>
          <Link
            to="/login"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold"
          >
            Zaloguj się!
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <p className="p-6 pt-20 text-gray-300">Ładowanie tablic...</p>;
  }

  const favoriteBoards = boards.filter((b) => b.isFavorite);
  const regularBoards = boards.filter((b) => !b.isFavorite);

  const groupVisibility = (list) => ({
    public: list.filter((b) => b.isPublic),
    private: list.filter((b) => !b.isPublic),
  });

  const favoriteGrouped = groupVisibility(favoriteBoards);
  const regularGrouped = groupVisibility(regularBoards);

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;

    setCreating(true);
    try {
      await axios.post(
        "http://localhost:8080/api/boards",
        { name: newBoardName, isPublic },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewBoardName("");
      setIsPublic(true);
      setIsModalOpen(false);
      fetchBoards();
    } catch (err) {
      console.error("Nie udało się utworzyć tablicy:", err);
      alert("Nie udało się utworzyć tablicy!");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteBoard = async (boardId) => {
    if (!window.confirm("Czy na pewno chcesz usunąć tą tablicę?")) return;

    try {
      await axios.delete(`http://localhost:8080/api/boards/${boardId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBoards();
    } catch (err) {
      console.error("Nie udało się usunąć tablicy:", err);
      alert("Nie udało się usunąć tablicy, sprawdź konsole.");
    }
  };

  const handleToggleFavorite = async (board) => {
    try {
      if (board.isFavorite) {
        await axios.delete(
          `http://localhost:8080/api/boards/${board.id}/favorite`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `http://localhost:8080/api/boards/${board.id}/favorite`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      fetchBoards();
    } catch (err) {
      console.error("Nie udało się zmienić ulubionych:", err);
      alert("Nie udało się zmienić ulubionych.");
    }
  };

  return (
    <div className="p-6 pt-20 min-h-screen bg-gray-900 text-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Lista dostępnych tablic</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition"
        >
          + Stwórz nową tablicę
        </button>
      </div>

      {boards.length === 0 ? (
        <p className="text-gray-400">Nie masz jeszcze tablic.</p>
      ) : (
        <>
          {favoriteBoards.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xl font-semibold mb-3">⭐ Ulubione</h2>

              {favoriteGrouped.public.length > 0 && (
                <>
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-gray-800 border border-gray-700 text-gray-300 mb-1">
                    <FaGlobe size={12} /> Publiczne
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
                    {favoriteGrouped.public.map((board) => (
                      <BoardCard
                        key={board.id}
                        board={board}
                        onDelete={handleDeleteBoard}
                        onToggleFavorite={handleToggleFavorite}
                        onEdit={() => {
                          setSelectedBoard(board);
                          setIsEditOpen(true);
                        }}
                      />
                    ))}
                  </div>
                </>
              )}

              {favoriteGrouped.private.length > 0 && (
                <>
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-gray-800 border border-gray-700 text-gray-300 mb-1">
                    <FaLock size={12} /> Prywatne
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {favoriteGrouped.private.map((board) => (
                      <BoardCard
                        key={board.id}
                        board={board}
                        onDelete={handleDeleteBoard}
                        onToggleFavorite={handleToggleFavorite}
                        onEdit={() => {
                          setSelectedBoard(board);
                          setIsEditOpen(true);
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          <div>
            <h2 className="text-xl font-semibold mb-3">📁 Pozostałe</h2>

            {regularGrouped.public.length > 0 && (
              <>
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-gray-800 border border-gray-700 text-gray-300 mb-1">
                  <FaGlobe size={12} /> Publiczne
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
                  {regularGrouped.public.map((board) => (
                    <BoardCard
                      key={board.id}
                      board={board}
                      onDelete={handleDeleteBoard}
                      onToggleFavorite={handleToggleFavorite}
                      onEdit={() => {
                        setSelectedBoard(board);
                        setIsEditOpen(true);
                      }}
                    />
                  ))}
                </div>
              </>
            )}

            {regularGrouped.private.length > 0 && (
              <>
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-gray-800 border border-gray-700 text-gray-300 mb-1">
                  <FaLock size={12} /> Prywatne
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {regularGrouped.private.map((board) => (
                    <BoardCard
                      key={board.id}
                      board={board}
                      onDelete={handleDeleteBoard}
                      onToggleFavorite={handleToggleFavorite}
                      onEdit={() => {
                        setSelectedBoard(board);
                        setIsEditOpen(true);
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Utwórz nową tablicę"
      >
        <form onSubmit={handleCreateBoard} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Nazwa tablicy"
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
            className="p-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 w-full"
            required
          />
          <label className="flex items-center gap-2 text-gray-100">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-4 h-4 accent-blue-400"
            />
            Publiczna
          </label>
          <button
            type="submit"
            disabled={creating}
            className="px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition disabled:opacity-50"
          >
            Stwórz tablicę!
          </button>
        </form>
      </Modal>

      {selectedBoard && (
        <BoardEditModal
          board={selectedBoard}
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setSelectedBoard(null);
          }}
          onEdit={fetchBoards}
        />
      )}
    </div>
  );
};

export default BoardsPage;
