import React, { useState, useEffect } from "react";
import Modal from "../Modal";
import { useCookies } from "react-cookie";
import axios from "axios";
import priorityMap from "../../constants/priorityMap";

const TaskPreviewModal = ({ task, isOpen, onClose }) => {
  const [cookie] = useCookies(["token"]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

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

  useEffect(() => {
    if (!isOpen || !task) return;

    const fetchComments = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/tasks/${task.id}/comments`,
          {
            headers: { Authorization: `Bearer ${cookie.token}` },
          }
        );
        setComments(response.data);
      } catch (err) {
        console.error("Błąd podczas załadowania komentarzy", err);
        setComments([]);
      }
    };

    fetchComments();
  }, [isOpen, task, cookie.token]);

  if (!task) return null;

  const priority = priorityMap[task.priority] || {
    text: "Brak",
    color: "bg-gray-600",
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${task.name}`}>
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
            className={`text-xs font-semibold ${
              task.isActive ? "text-green-400" : "text-red-400"
            }`}
          >
            {task.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        <div className="mt-4">
          <h3 className="text-gray-200 font-semibold mb-2">Komentarze:</h3>
          {comments.length === 0 ? (
            <p className="text-gray-400 text-sm">Brak komentarzy pod postem</p>
          ) : (
            <ul className="flex flex-col gap-2 max-h-64 overflow-y-auto">
              {comments.map((c) => (
                <li
                  key={c.id}
                  className="bg-gray-700 p-2 rounded-md border border-gray-600"
                >
                  <p className="text-gray-100">{c.comment}</p>
                  <p className="text-gray-400 text-xs mt-1">
                    {c.username} - {new Date(c.createdDate).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <form onSubmit={handleCommentSubmit} className="mt-4 flex gap-2">
        <input
          type="text"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="flex-1 rounded-md bg-gray-700 text-gray-100 p-2 border border-gray-600 focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-md"
        >
          Add
        </button>
      </form>
    </Modal>
  );
};

export default TaskPreviewModal;
