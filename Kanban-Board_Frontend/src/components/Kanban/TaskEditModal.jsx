import { useState, useEffect } from "react";
import Modal from "../Modal";
import { useCookies } from "react-cookie";
import axios from "axios";
import priorityMap from "../../constants/priorityMap";

const TaskEditModal = ({ task, columns, isOpen, onClose, onRefresh }) => {
  const [cookie] = useCookies(["token"]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    dueDate: "",
    columnId: "",
    isActive: true,
    priority: "MEDIUM",
  });

  useEffect(() => {
    if (isOpen && task) {
      setFormData({
        name: task.name || "",
        description: task.description || "",
        dueDate: task.dueDate ? task.dueDate.slice(0, 16) : "",
        columnId: task.columnId || "",
        isActive: task.isActive ?? true,
        priority: task.priority || "MEDIUM",
      });
    }
  }, [task, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!task) return;

    try {
      await axios.put(
        `http://localhost:8080/api/columns/${formData.columnId}/tasks/${task.id}`,
        {
          name: formData.name,
          description: formData.description,
          dueDate: formData.dueDate,
          isActive: formData.isActive,
          priority: formData.priority,
        },
        { headers: { Authorization: `Bearer ${cookie.token}` } }
      );

      onRefresh();
      onClose();
    } catch (error) {
      console.error("Nie udało się zaktualizować zadania:", error);
      alert("Problem podczas aktualizacji zadania");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edytuj zadanie`}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <label className="block text-gray-300 text-sm font-medium mb-1">
          Nazwa zadania
          <input
            type="text"
            name="name"
            placeholder="Enter task title..."
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded-md bg-gray-700 text-gray-100 p-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </label>

        <label className="block text-gray-300 text-sm font-medium mb-1">
          Opis zadania
          <textarea
            name="description"
            placeholder="Dodaj opis..."
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-md bg-gray-700 text-gray-100 p-2 border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
          />
        </label>

        <label className="block text-gray-300 text-sm font-medium mb-1">
          Data i czas zakończenia
          <input
            type="datetime-local"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className="w-full rounded-md bg-gray-700 text-gray-100 p-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </label>

        <label className="block text-gray-300 text-sm font-medium mb-1">
          Kolumna
          <select
            name="columnId"
            value={formData.columnId}
            onChange={handleChange}
            className="w-full rounded-md bg-gray-700 text-gray-100 p-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            {columns.map((col) => (
              <option key={col.id} value={col.id}>
                {col.title}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-gray-300 text-sm font-medium mb-1">
          Priorytet
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className={`w-full rounded-md p-2 border focus:border-blue-500 focus:outline-none ${
              priorityMap[formData.priority]?.color || "bg-gray-700"
            } text-white`}
          >
            {Object.entries(priorityMap).map(([key, val]) => (
              <option key={key} value={key} className={val.color}>
                {val.text}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="h-4 w-4 accent-blue-600"
          />
          <label className="text-gray-300 text-sm">Aktywne?</label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition"
          >
            Zapisz zmiany
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskEditModal;
