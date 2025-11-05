import React, { useState, useEffect } from "react";
import Modal from "../Modal";
import { useCookies } from "react-cookie";
import axios from "axios";
import priorityMap from "../../constants/PriorityMap.jsx";
import TaskComment from "./TaskComment";

const TaskPreviewModal = ({ task, isOpen, onClose }) => {
  const [cookie] = useCookies(["token"]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [activeTab, setActiveTab] = useState("info");

  const fetchComments = async () => {
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
  };

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen, task]);

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

  if (!task) return null;

  const priority = priorityMap[task.priority] || {
    text: "Brak",
    color: "bg-gray-600",
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task.name}>
      <div className="flex border-b border-gray-700 mb-4">
        <button
          onClick={() => setActiveTab("info")}
          className={`flex-1 py-2 px-4 text-center font-semibold ${
            activeTab === "info"
              ? "border-b-2 border-blue-500 text-white"
              : "text-gray-400"
          }`}
        >
          Zadanie
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
            <p className="text-gray-300 font-medium mb-1">Opis zadania:</p>
            <p className="text-gray-400 font-light leading-relaxed">
              {task.description || "Brak opisu zadania."}
            </p>
          </div>

          <div className="text-sm text-gray-400">
            Deadline:{" "}
            {task.dueDate
              ? new Date(task.dueDate).toLocaleString()
              : "Brak deadline"}
          </div>

          <div className="flex justify-between items-center">
            <span
              className={`px-2 py-1 rounded-md text-xs font-semibold text-white ${priority.color}`}
            >
              {priority.text}
            </span>
            <span
              className={`text-xs font-semibold ${task.isActive ? "text-green-400" : "text-red-400"}`}
            >
              {task.isActive ? "Active" : "Inactive"}
            </span>
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
