import React, { useState, useEffect, useCallback } from "react";
import Modal from "../Modal";
import { useCookies } from "react-cookie";
import axios from "axios";
import priorityMap from "../../constants/PriorityMap.jsx";
import TaskComment from "./TaskComment";
import {
  FaExclamationTriangle,
  FaInfoCircle,
  FaComments,
  FaClock,
} from "react-icons/fa";

const roleColors = {
  ADMIN: "bg-red-600 text-white",
  EDITOR: "bg-yellow-600 text-white",
  VIEWER: "bg-gray-500 text-white",
};

const TaskPreviewModal = ({ task, isOpen, onClose, boardMembers }) => {
  const [cookie] = useCookies(["token"]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [timeEntries, setTimeEntries] = useState([]);
  const [newEntry, setNewEntry] = useState({
    minutesSpent: "",
    entryDate: "",
    isOvertime: false,
  });
  const [activeTab, setActiveTab] = useState("info");
  const [showAssignList, setShowAssignList] = useState(false);
  const [assignedUsername, setAssignedUsername] = useState(
    task?.assignedUsername || null
  );

  const fetchComments = useCallback(async () => {
    if (!task?.id) return;
    try {
      const response = await axios.get(
        `http://localhost:8080/api/tasks/${task.id}/comments`,
        { headers: { Authorization: `Bearer ${cookie.token}` } }
      );
      setComments(response.data);
    } catch (err) {
      console.error("Błąd podczas załadowania komentarzy", err);
      setComments([]);
    }
  }, [task?.id, cookie.token]);

  const fetchTimeEntries = useCallback(async () => {
    if (!task?.id) return;
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    try {
      const res = await axios.get(
        `http://localhost:8080/api/tasks/${task.id}/time-entries?year=${year}&month=${month}`,
        { headers: { Authorization: `Bearer ${cookie.token}` } }
      );
      setTimeEntries(
        res.data.sort((a, b) => new Date(b.entryDate) - new Date(a.entryDate))
      );
    } catch (err) {
      console.error("Błąd przy pobieraniu wpisów czasu", err);
      setTimeEntries([]);
    }
  }, [task?.id, cookie.token]);

  useEffect(() => {
    if (!task) return;

    setAssignedUsername(task.assignedUsername || null);

    if (isOpen) {
      fetchComments();
      fetchTimeEntries();
      setNewEntry({ minutesSpent: "", entryDate: "" });
    }
  }, [isOpen, task, fetchComments, fetchTimeEntries]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await axios.post(
        `http://localhost:8080/api/tasks/${task.id}/comments`,
        { comment: newComment },
        { headers: { Authorization: `Bearer ${cookie.token}` } }
      );
      setComments((prev) => [...prev, response.data]);
      setNewComment("");
    } catch (err) {
      console.error("Nie udało się dodać komentarza", err);
      alert("Nie można było dodać komentarza");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Czy na pewno chcesz usunąć ten komentarz?")) return;

    try {
      await axios.delete(
        `http://localhost:8080/api/tasks/${task.id}/comments/${commentId}`,
        { headers: { Authorization: `Bearer ${cookie.token}` } }
      );
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error("Nie udało się usunąć komentarza", err);
      alert("Nie udało się usunąć komentarza");
    }
  };

  const handleAssignUser = async (userId) => {
    try {
      const response = await axios.patch(
        `http://localhost:8080/api/columns/${task.columnId}/tasks/${task.id}/assign`,
        { userId: userId },
        { headers: { Authorization: `Bearer ${cookie.token}` } }
      );

      const updatedTask = response.data;
      setAssignedUsername(updatedTask.assignedUsername || null);

      setShowAssignList(false);
    } catch (err) {
      console.error("Nie udało się przypisać użytkownika", err);
      alert("Nie udało się przypisać użytkownika");
    }
  };

  const handleAddEntry = async (e) => {
    e.preventDefault();
    if (
      newEntry.minutesSpent === "" ||
      newEntry.entryDate === "" ||
      Number(newEntry.minutesSpent) <= 0
    ) {
      alert("Podaj poprawną liczbę minut oraz datę.");
      return;
    }

    try {
      const payload = {
        minutesSpent: Number(newEntry.minutesSpent),
        entryDate: newEntry.entryDate,
        isOvertime: newEntry.isOvertime,
      };
      const res = await axios.post(
        `http://localhost:8080/api/tasks/${task.id}/time-entries`,
        payload,
        { headers: { Authorization: `Bearer ${cookie.token}` } }
      );
      setTimeEntries((prev) =>
        [...prev, res.data].sort(
          (a, b) => new Date(b.entryDate) - new Date(a.entryDate)
        )
      );
      setNewEntry({ minutesSpent: "", entryDate: "", isOvertime: false });
    } catch (err) {
      console.error("Nie udało się dodać wpisu czasu", err);
      alert("Nie udało się dodać wpisu czasu");
    }
  };

  const handleUpdateEntry = async (id, updated) => {
    if (!updated || !("minutesSpent" in updated) || !updated.entryDate) {
      alert("Niepoprawne dane do aktualizacji.");
      return;
    }

    try {
      await axios.put(
        `http://localhost:8080/api/tasks/${task.id}/time-entries/${id}`,
        {
          minutesSpent: Number(updated.minutesSpent),
          entryDate: updated.entryDate,
          isOvertime: updated.isOvertime,
        },
        { headers: { Authorization: `Bearer ${cookie.token}` } }
      );
      setTimeEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...updated } : e))
      );
    } catch (err) {
      console.error("Nie udało się zaktualizować wpisu czasu", err);
      alert("Nie udało się zaktualizować wpisu czasu");
    }
  };

  const handleDeleteEntry = async (id) => {
    if (!window.confirm("Czy na pewno chcesz usunąć ten wpis?")) return;
    try {
      await axios.delete(
        `http://localhost:8080/api/tasks/${task.id}/time-entries/${id}`,
        { headers: { Authorization: `Bearer ${cookie.token}` } }
      );
      setTimeEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error("Nie udało się usunąć wpisu czasu", err);
      alert("Nie udało się usunąć wpisu czasu");
    }
  };

  const formatMinutes = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours && minutes) return `${hours}h ${minutes}m`;
    if (hours) return `${hours}h`;
    return `${minutes}m`;
  };

  const handleClose = () => {
    setActiveTab("info");
    setShowAssignList(false);
    onClose();
  };

  if (!task) return null;

  const priority = priorityMap[task.priority] || {
    text: "Brak",
    color: "bg-gray-600",
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={task.name}
      width="45rem"
    >
      <div className="flex border-b border-gray-700 mb-4">
        <button
          onClick={() => setActiveTab("info")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 font-semibold ${
            activeTab === "info"
              ? "border-b-2 border-blue-500 text-white"
              : "text-gray-400"
          }`}
        >
          <FaInfoCircle />
          <span>Informacje</span>
        </button>

        <button
          onClick={() => setActiveTab("comments")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 font-semibold ${
            activeTab === "comments"
              ? "border-b-2 border-blue-500 text-white"
              : "text-gray-400"
          }`}
        >
          <FaComments />
          <span>Komentarze ({comments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("time")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 font-semibold ${
            activeTab === "time"
              ? "border-b-2 border-blue-500 text-white"
              : "text-gray-400"
          }`}
        >
          <FaClock />
          <span>Rejestracja czasu ({timeEntries.length})</span>
        </button>
      </div>

      {activeTab === "info" && (
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-gray-300 font-semibold mb-1 uppercase text-sm tracking-wide">
              Opis zadania
            </p>
            <p className="text-gray-200 leading-relaxed">
              {task.description || "Brak opisu zadania."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-300 font-semibold uppercase text-xs tracking-wide">
                Utworzono
              </p>
              <p className="text-gray-200">
                {task.createdDate
                  ? new Date(task.createdDate).toLocaleString()
                  : "-"}
              </p>
            </div>

            <div>
              <p className="text-gray-300 font-semibold uppercase text-xs tracking-wide">
                Deadline
              </p>
              {(() => {
                const isOverdue =
                  task.dueDate &&
                  new Date(task.dueDate) < new Date() &&
                  task.isActive;
                return (
                  <span
                    className={`flex items-center gap-1 ${
                      task.isActive
                        ? isOverdue
                          ? "text-red-400 font-medium"
                          : "text-gray-200"
                        : "text-gray-400 opacity-50 line-through"
                    }`}
                  >
                    {isOverdue && <FaExclamationTriangle size={14} />}
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "Brak deadline"}
                  </span>
                );
              })()}
            </div>

            <div>
              <p className="text-gray-300 font-semibold uppercase text-xs tracking-wide">
                Priorytet
              </p>
              <span
                className={`px-2 py-1 rounded-md text-xs font-semibold text-white ${priority.color}`}
              >
                {priority.text}
              </span>
            </div>

            <div>
              <p className="text-gray-300 font-semibold uppercase text-xs tracking-wide">
                Status
              </p>
              <span
                className={`text-xs font-semibold ${
                  task.isActive ? "text-green-400" : "text-red-400"
                }`}
              >
                {task.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="col-span-2">
              <p className="text-gray-300 font-semibold uppercase text-xs tracking-wide">
                Przypisany użytkownik
              </p>
              <div className="flex items-center gap-2">
                {assignedUsername ? (
                  <>
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 border border-gray-500 flex items-center justify-center text-white font-semibold text-sm">
                      {assignedUsername[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-gray-200 font-medium">
                        {assignedUsername}
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-400">Brak przypisanego użytkownika</p>
                )}

                <button
                  onClick={() => setShowAssignList((prev) => !prev)}
                  className="ml-auto px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition"
                >
                  Zmień użytkownika
                </button>
              </div>

              {showAssignList && (
                <div className="mt-2 flex flex-col gap-2 max-h-40 overflow-y-auto">
                  <button
                    onClick={() => handleAssignUser(null)}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-gray-200 font-medium transition"
                  >
                    Usuń przypisanie
                  </button>

                  {boardMembers.map((member) => (
                    <button
                      key={member.userId}
                      onClick={() => handleAssignUser(member.userId)}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition text-left"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 border border-gray-500 flex items-center justify-center text-white font-semibold text-sm">
                        {member.username[0].toUpperCase()}
                      </div>
                      <span className="text-gray-200 font-medium">
                        {member.username}
                      </span>
                      {member.boardRole && (
                        <span
                          className={`ml-1 px-1 py-0.5 rounded text-xs font-semibold ${roleColors[member.boardRole]}`}
                        >
                          {member.boardRole}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "comments" && (
        <div className="flex flex-col gap-4">
          {comments.length === 0 ? (
            <p className="text-gray-400 text-sm">Brak komentarzy pod postem</p>
          ) : (
            <ul className="flex flex-col gap-2 max-h-64 overflow-y-auto px-2">
              {comments.map((c) => (
                <TaskComment
                  key={c.id}
                  comment={c}
                  onDelete={handleDeleteComment}
                />
              ))}
            </ul>
          )}

          <form onSubmit={handleCommentSubmit} className="mt-2 flex gap-2">
            <input
              type="text"
              placeholder="Dodaj komentarz..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 rounded-md bg-gray-700 text-gray-100 p-2 border border-gray-600 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-md"
            >
              Dodaj
            </button>
          </form>
        </div>
      )}

      {activeTab === "time" && (
        <div className="flex flex-col gap-4">
          {timeEntries.length === 0 ? (
            <p className="text-gray-400 text-sm">Brak wpisów czasu</p>
          ) : (
            <div className="overflow-auto max-h-80 rounded-md border border-gray-700">
              <table className="w-full text-sm text-left text-gray-300 border-collapse">
                <thead className="bg-gray-700 text-gray-200 uppercase text-xs tracking-wide sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-2">Użytkownik</th>
                    <th className="px-3 py-2">Czas pracy</th>
                    <th className="px-3 py-2">Typ pracy</th>
                    <th className="px-3 py-2">Data</th>
                    <th className="px-3 py-2 text-center">Akcje</th>
                  </tr>
                </thead>
                <tbody>
                  {timeEntries.map((entry) => (
                    <tr
                      key={entry.id}
                      className="border-t border-gray-700 hover:bg-gray-800"
                    >
                      <td className="px-3 py-2">{entry.username}</td>
                      <td className="px-3 py-2">
                        {formatMinutes(entry.minutesSpent)}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                            entry.isOvertime
                              ? "bg-yellow-500 text-gray-900"
                              : "bg-green-600 text-white"
                          }`}
                        >
                          {entry.isOvertime ? "Nadgodziny" : "Normalny"}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        {new Date(entry.entryDate).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2 flex gap-2 items-center">
                        <button
                          onClick={() => {
                            const newMinutes = prompt(
                              "Podaj nową liczbę minut:",
                              String(entry.minutesSpent)
                            );
                            const newDate = prompt(
                              "Podaj nową datę (YYYY-MM-DD):",
                              entry.entryDate
                            );
                            if (newMinutes !== null && newDate !== null) {
                              handleUpdateEntry(entry.id, {
                                minutesSpent: Number(newMinutes),
                                entryDate: newDate,
                              });
                            }
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md px-3 py-1 text-sm font-semibold transition"
                        >
                          Edytuj
                        </button>

                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="w-full bg-red-600 hover:bg-red-700 text-white rounded-md px-3 py-1 text-sm font-semibold transition"
                        >
                          Usuń
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <form
            onSubmit={handleAddEntry}
            className="bg-gray-800 p-6 rounded-xl shadow-md flex flex-col gap-4 mt-4"
          >
            <p className="text-gray-300 font-semibold uppercase text-xs tracking-wide">
              Dodaj nowy wpis czasu
            </p>

            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex flex-col flex-1">
                <label className="text-gray-400 text-xs mb-1">Dzień</label>
                <input
                  type="date"
                  value={newEntry.entryDate}
                  onChange={(e) =>
                    setNewEntry((prev) => ({
                      ...prev,
                      entryDate: e.target.value,
                    }))
                  }
                  className="bg-gray-700 border border-gray-600 text-gray-100 rounded-md p-2 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex flex-col w-32">
                <label className="text-gray-400 text-xs mb-1">Minuty</label>
                <input
                  type="number"
                  min="1"
                  value={newEntry.minutesSpent}
                  onChange={(e) =>
                    setNewEntry((prev) => ({
                      ...prev,
                      minutesSpent: e.target.value,
                    }))
                  }
                  className="bg-gray-700 border border-gray-600 text-gray-100 rounded-md p-2 focus:outline-none focus:border-blue-500"
                  placeholder="np. 60"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newEntry.isOvertime}
                  onChange={(e) =>
                    setNewEntry((prev) => ({
                      ...prev,
                      isOvertime: e.target.checked,
                    }))
                  }
                  id="overtime-checkbox"
                  className="accent-yellow-400 w-4 h-4"
                />
                <label
                  htmlFor="overtime-checkbox"
                  className="text-gray-300 text-sm"
                >
                  Nadgodziny
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition"
            >
              Dodaj wpis
            </button>
          </form>
        </div>
      )}
    </Modal>
  );
};

export default TaskPreviewModal;
