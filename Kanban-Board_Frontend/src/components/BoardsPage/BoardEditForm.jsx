import React, { useState } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";

const BoardEditModal = ({ board, onClose, onEdit }) => {
  const [name, setName] = useState(board.name);
  const [isPublic, setIsPublic] = useState(board.isPublic);
  const [saving, setSaving] = useState(false);
  const [cookie] = useCookies("token");

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(
        `http://localhost:8080/api/boards/${board.id}`,
        { name, isPublic },
        { headers: { Authorization: `Bearer ${cookie.token}` } }
      );
      onEdit();
      onClose();
    } catch (err) {
      console.error("Nie udało się zaktualizować tablicy:", err);
      alert("Nie udało się zapisać zmian.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-3">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nazwa tablicy"
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

      <div className="text-gray-300 text-sm mt-2">
        <p className="font-semibold mb-1">Członkowie:</p>
        <ul className="list-disc list-inside">
          {board.members.map((m) => (
            <li key={m.userId}>
              {m.username} ({m.email}) - {m.boardRole}
            </li>
          ))}
        </ul>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition disabled:opacity-50"
      >
        Zapisz zmiany
      </button>
    </form>
  );
};

export default BoardEditModal;
