import React, { useCallback, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import axios from "axios";
import Modal from "../components/Modal";
import BoardCard from "../components/BoardsPage/BoardCard";

const BoardsPage = () => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cookie] = useCookies("token");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchBoards = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8080/api/boards", {
        headers: { Authorization: `Bearer ${cookie.token}` },
      });
      setBoards(response.data);
    } catch (err) {
      console.error("Nie udało się pobrać tablic:", err);
      setBoards([]);
    } finally {
      setLoading(false);
    }
  }, [cookie.token]);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;

    setCreating(true);
    try {
      await axios.post(
        "http://localhost:8080/api/boards",
        { name: newBoardName, isPublic },
        { headers: { Authorization: `Bearer ${cookie.token}` } }
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
        headers: { Authorization: `Bearer ${cookie.token}` },
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
          {
            headers: { Authorization: `Bearer ${cookie.token}` },
          }
        );
      } else {
        await axios.post(
          `http://localhost:8080/api/boards/${board.id}/favorite`,
          {},
          {
            headers: { Authorization: `Bearer ${cookie.token}` },
          }
        );
      }
      fetchBoards();
    } catch (err) {
      console.error("Nie udało się zmienić ulubionych:", err);
      alert("Nie udało się zmienić ulubionych.");
    }
  };

  if (loading)
    return <p className="p-6 pt-20 text-gray-300">Ładowanie tablic...</p>;

  const favoriteBoards = boards.filter((b) => b.isFavorite);
  const otherBoards = boards.filter((b) => !b.isFavorite);

  return (
    <div className="p-6 pt-20 min-h-screen bg-gray-900 text-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold mb-4">Twoje tablice</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition"
        >
          + Stwórz nową tablicę
        </button>
      </div>

      {boards.length === 0 ? (
        <p>Nie masz żadnych tablic, pomyśl nad utworzeniem nowej.</p>
      ) : (
        <>
          {favoriteBoards.length > 0 && (
            <>
              <h2 className="text-xl font-semibold mb-2">
                Twoje ulubione tablice:
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {favoriteBoards.map((board) => (
                  <BoardCard
                    key={board.id}
                    board={board}
                    onDelete={handleDeleteBoard}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            </>
          )}

          {otherBoards.length > 0 && (
            <>
              <h2 className="text-xl font-semibold mb-2">Pozostałe tablice:</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {otherBoards.map((board) => (
                  <BoardCard
                    key={board.id}
                    board={board}
                    onDelete={handleDeleteBoard}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            </>
          )}
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
    </div>
  );
};

export default BoardsPage;
