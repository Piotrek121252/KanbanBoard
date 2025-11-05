import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import { FaUsers, FaInfoCircle } from "react-icons/fa";
import Modal from "../Modal";

const BoardEditModal = ({ board, isOpen, onClose, onEdit }) => {
  const [activeTab, setActiveTab] = useState("info");
  const [name, setName] = useState(board.name);
  const [isPublic, setIsPublic] = useState(board.isPublic);
  const [saving, setSaving] = useState(false);
  const [cookie] = useCookies("token");

  const [allUsers, setAllUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAvailableUsers = useCallback(async () => {
    if (!board?.id) return;

    try {
      const res = await axios.get(
        `http://localhost:8080/api/users?excludeBoardId=${Number(board.id)}&search=${encodeURIComponent(searchQuery)}`,
        { headers: { Authorization: `Bearer ${cookie.token}` } }
      );
      setAllUsers(res.data);
    } catch (err) {
      console.error("Nie udało się pobrać użytkowników:", err);
    }
  }, [board?.id, searchQuery, cookie.token]);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableUsers();
    }
  }, [isOpen, fetchAvailableUsers]);

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

  const addMember = async (userId, role = "VIEWER") => {
    if (!userId) return;
    try {
      await axios.post(
        `http://localhost:8080/api/boards/${board.id}/members`,
        { userId: Number(userId), role: role },
        { headers: { Authorization: `Bearer ${cookie.token}` } }
      );
      if (onEdit) onEdit();
      fetchAvailableUsers();
    } catch (err) {
      console.error("Nie udało się dodać członka:", err);
      alert("Nie udało się dodać członka.");
    }
  };

  const deleteMember = async (userId) => {
    if (!userId) return;
    try {
      await axios.delete(
        `http://localhost:8080/api/boards/${board.id}/members/${Number(userId)}`,
        { headers: { Authorization: `Bearer ${cookie.token}` } }
      );
      if (onEdit) onEdit();
    } catch (err) {
      console.error("Nie udało się usunąć członka:", err);
      alert("Nie udało się usunąć członka.");
    }
  };

  const changeMemberRole = async (userId, role) => {
    if (!userId) return;
    try {
      await axios.patch(
        `http://localhost:8080/api/boards/${board.id}/members/${Number(
          userId
        )}/role`,
        { role: role },
        { headers: { Authorization: `Bearer ${cookie.token}` } }
      );
      if (onEdit) onEdit();
    } catch (err) {
      console.error("Nie udało się zmienić roli członka:", err);
      alert("Nie udało się zmienić roli członka.");
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
        <div className="mt-2 flex flex-col gap-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Szukaj użytkowników do dodania..."
            className="p-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 w-full"
          />

          <div className="mt-2 max-h-96 overflow-y-auto flex flex-col gap-2">
            {allUsers.map((user) => (
              <div
                key={`add-${user.id}`}
                className="flex justify-between items-center p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
              >
                <div>
                  <p className="text-gray-100 font-semibold">{user.username}</p>
                  <p className="text-gray-400 text-sm">{user.email}</p>
                </div>
                <button
                  onClick={() => addMember(user.id)}
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Dodaj
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 max-h-96 overflow-y-auto flex flex-col gap-2">
            {board.members.map((member) => {
              return (
                <div
                  key={`member-${member.userId}`}
                  className="flex justify-between items-center p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
                >
                  <div>
                    <p className="text-gray-100 font-semibold">
                      {member.username}
                    </p>
                    <p className="text-gray-400 text-sm">{member.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={member.boardRole}
                      onChange={(e) =>
                        changeMemberRole(member.userId, e.target.value)
                      }
                      className="bg-gray-800 text-gray-100 p-1 rounded-lg"
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="EDITOR">EDITOR</option>
                      <option value="VIEWER">VIEWER</option>
                    </select>
                    <button
                      onClick={() => deleteMember(member.userId)}
                      className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      Usuń
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default BoardEditModal;
