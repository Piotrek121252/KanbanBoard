import React, { useState } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import { FaUsers, FaInfoCircle } from "react-icons/fa";
import Modal from "../Modal";

const BoardEditModal = ({ board, isOpen, onClose, onEdit }) => {
  const [activeTab, setActiveTab] = useState("info"); // "info" or "members"
  const [name, setName] = useState(board.name);
  const [isPublic, setIsPublic] = useState(board.isPublic);
  const [saving, setSaving] = useState(false);
  const [cookie] = useCookies("token");

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.patch(
        `http://localhost:8080/api/boards/${board.id}`,
        { name, isPublic },
        { headers: { Authorization: `Bearer ${cookie.token}` } }
      );
      if (onEdit) onEdit();
      onClose();
    } catch (err) {
      console.error("Nie udało się zaktualizować tablicy:", err);
      alert("Nie udało się zapisać zmian.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex border-b border-gray-700 mb-4">
        <button
          onClick={() => setActiveTab("info")}
          className={`flex-1 py-2 px-4 text-center font-semibold flex items-center justify-center gap-2 ${
            activeTab === "info"
              ? "border-b-2 border-blue-500 text-white"
              : "text-gray-400"
          }`}
        >
          <FaInfoCircle /> Informacje
        </button>
        <button
          onClick={() => setActiveTab("members")}
          className={`flex-1 py-2 px-4 text-center font-semibold flex items-center justify-center gap-2 ${
            activeTab === "members"
              ? "border-b-2 border-blue-500 text-white"
              : "text-gray-400"
          }`}
        >
          <FaUsers /> Członkowie
        </button>
      </div>

      {activeTab === "info" && (
        <form onSubmit={handleSave} className="flex flex-col gap-3">
          <label className="flex items-center gap-2 text-gray-100">
            Nazwa tablicy:
          </label>
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
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition disabled:opacity-50"
          >
            Zapisz zmiany
          </button>
        </form>
      )}

      {activeTab === "members" && (
        <div className="mt-2 max-h-96 overflow-y-auto flex flex-col gap-4">
          {board.members.map((member) => {
            let roleColor = "bg-gray-500 text-white";
            if (member.boardRole === "ADMIN")
              roleColor = "bg-red-500 text-white";
            else if (member.boardRole === "EDITOR")
              roleColor = "bg-yellow-500 text-black";
            else if (member.boardRole === "VIEWER")
              roleColor = "bg-green-500 text-white";

            return (
              <div
                key={member.userId}
                className="w-full p-4 bg-gray-700 rounded-lg shadow hover:bg-gray-600 transition"
              >
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {member.username[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-gray-100 font-semibold text-lg">
                      {member.username}
                    </p>
                    <p className="text-gray-300 text-sm">{member.email}</p>
                  </div>
                </div>
                <span
                  className={`inline-block px-3 py-1 rounded font-semibold text-sm ${roleColor}`}
                >
                  {member.boardRole}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
};

export default BoardEditModal;
