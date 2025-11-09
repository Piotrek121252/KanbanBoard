import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import { FaUsers, FaInfoCircle } from "react-icons/fa";
import Modal from "../Modal";

const roleColors = {
  ADMIN: "text-red-400 border-red-400/40",
  EDITOR: "text-blue-400 border-blue-400/40",
  VIEWER: "text-gray-400 border-gray-400/40",
};

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
        `http://localhost:8080/api/users?excludeBoardId=${Number(
          board.id
        )}&search=${encodeURIComponent(searchQuery)}`,
        { headers: { Authorization: `Bearer ${cookie.token}` } }
      );
      setAllUsers(res.data);
    } catch (err) {
      console.error("Nie udało się pobrać użytkowników:", err);
    }
  }, [board?.id, searchQuery, cookie.token]);

  useEffect(() => {
    if (isOpen) fetchAvailableUsers();
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
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const addMember = async (userId) => {
    try {
      await axios.post(
        `http://localhost:8080/api/boards/${board.id}/members`,
        { userId: Number(userId), role: "VIEWER" },
        { headers: { Authorization: `Bearer ${cookie.token}` } }
      );
      if (onEdit) onEdit();
      fetchAvailableUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteMember = async (userId) => {
    try {
      await axios.delete(
        `http://localhost:8080/api/boards/${board.id}/members/${Number(userId)}`,
        { headers: { Authorization: `Bearer ${cookie.token}` } }
      );
      if (onEdit) onEdit();
    } catch (err) {
      console.error(err);
    }
  };

  const changeMemberRole = async (userId, role) => {
    try {
      await axios.patch(
        `http://localhost:8080/api/boards/${board.id}/members/${Number(
          userId
        )}/role`,
        { role },
        { headers: { Authorization: `Bearer ${cookie.token}` } }
      );
      if (onEdit) onEdit();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} width="60rem">
      <div className="flex border-b border-gray-700 mb-4">
        <button
          onClick={() => setActiveTab("info")}
          className={`flex-1 py-2 px-4 flex items-center justify-center gap-2 font-semibold ${
            activeTab === "info"
              ? "border-b-2 border-blue-500 text-white"
              : "text-gray-400"
          }`}
        >
          <FaInfoCircle /> Informacje
        </button>

        <button
          onClick={() => setActiveTab("members")}
          className={`flex-1 py-2 px-4 flex items-center justify-center gap-2 font-semibold ${
            activeTab === "members"
              ? "border-b-2 border-blue-500 text-white"
              : "text-gray-400"
          }`}
        >
          <FaUsers /> Członkowie
        </button>
      </div>

      {activeTab === "info" && (
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <label className="text-gray-100 text-sm">Nazwa tablicy</label>
          <input
            className="p-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label className="flex gap-2 items-center text-gray-200">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="h-4 w-4 accent-blue-500"
            />
            Tablica publiczna
          </label>

          <button
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition text-white"
          >
            Zapisz
          </button>
        </form>
      )}

      {activeTab === "members" && (
        <div className="mt-2 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <h3 className="text-gray-200 font-semibold mb-2">
                Członkowie tablicy
              </h3>

              <div className="max-h-[500px] overflow-y-auto flex flex-col gap-2 pr-1">
                {board.members.map((member) => (
                  <div
                    key={member.userId}
                    className="flex items-center justify-between bg-gray-800 p-3 rounded-lg border border-gray-700 hover:bg-gray-700 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-sm font-semibold text-gray-200">
                        {member.username[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-gray-100 font-medium">
                          {member.username}
                        </p>
                        <p className="text-gray-400 text-xs">{member.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={member.boardRole}
                        onChange={(e) =>
                          changeMemberRole(member.userId, e.target.value)
                        }
                        className={`px-2 py-1 rounded border bg-gray-900 text-xs ${
                          roleColors[member.boardRole]
                        }`}
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="EDITOR">EDITOR</option>
                        <option value="VIEWER">VIEWER</option>
                      </select>

                      <button
                        onClick={() => deleteMember(member.userId)}
                        className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 rounded-lg text-white"
                      >
                        Usuń
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col">
              <h3 className="text-gray-200 font-semibold mb-2">
                Dodaj użytkowników
              </h3>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Szukaj użytkowników..."
                className="p-2 mb-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-100"
              />

              <div className="max-h-[500px] overflow-y-auto flex flex-col gap-2 pr-1">
                {allUsers.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    Brak dostępnych użytkowników.
                  </p>
                ) : (
                  allUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between bg-gray-800 p-3 rounded-lg border border-gray-700 hover:bg-gray-700 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-sm font-semibold text-gray-200">
                          {user.username[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-gray-100 font-medium">
                            {user.username}
                          </p>
                          <p className="text-gray-400 text-xs">{user.email}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => addMember(user.id)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                      >
                        Dodaj
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default BoardEditModal;
