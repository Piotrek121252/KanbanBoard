import React, { useState, useEffect, useCallback } from "react";
import Modal from "../Modal";
import { useCookies } from "react-cookie";
import axios from "axios";
import priorityMap from "../../constants/PriorityMap.jsx";
import TaskComment from "./TaskComment";
import { FaExclamationTriangle } from "react-icons/fa";

const roleColors = {
  ADMIN: "bg-red-600 text-white",
  EDITOR: "bg-yellow-600 text-white",
  VIEWER: "bg-gray-500 text-white",
};

const TaskPreviewModal = ({ task, isOpen, onClose, boardMembers }) => {
  const [cookie] = useCookies(["token"]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
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

  useEffect(() => {
    if (!task) return;

    setAssignedUsername(task.assignedUsername || null);

    if (isOpen) fetchComments();
  }, [isOpen, task, fetchComments]);

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
      setAssignedUsername(updatedTask.assignedUsername);
      setShowAssignList(false);
    } catch (err) {
      console.error("Nie udało się przypisać użytkownika", err);
      alert("Nie udało się przypisać użytkownika");
    }
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
    <Modal isOpen={isOpen} onClose={handleClose} title={task.name}>
      <div className="flex border-b border-gray-700 mb-4">
        <button
          onClick={() => setActiveTab("info")}
          className={`flex-1 py-2 px-4 text-center font-semibold ${
            activeTab === "info"
              ? "border-b-2 border-blue-500 text-white"
              : "text-gray-400"
          }`}
        >
          Informacje
        </button>
        <button
          onClick={() => setActiveTab("comments")}
          className={`flex-1 py-2 px-4 text-center font-semibold ${
            activeTab === "comments"
              ? "border-b-2 border-blue-500 text-white"
              : "text-gray-400"
          }`}
        >
          Komentarze ({comments.length})
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
                {new Date(task.createdDate).toLocaleString()}
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
                className={`text-xs font-semibold ${task.isActive ? "text-green-400" : "text-red-400"}`}
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
    </Modal>
  );
};

export default TaskPreviewModal;
