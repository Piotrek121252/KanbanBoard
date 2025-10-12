import { useState, useEffect } from "react";
import Modal from "./Modal";
import { useCookies } from "react-cookie";
import axios from "axios";

const TaskEditModal = ({ task, isOpen, onClose, onSave }) => {
  const [cookie] = useCookies("token");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    dueDate: "",
    // isActive: true,
  });

  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name || "",
        description: task.description || "",
        dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
        // isActive: task.isActive ?? true, // Jeśli jest nullem to ustawiamy na true
      });
    }
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // const { name, value, type, checked } = e.target;
    // setFormData((prev) => ({
    //   ...prev,
    //   [name]: type === "checkbox" ? checked : value,
    // }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!task) return;

    try {
      const response = await axios.put(
        `http://localhost:8080/api/columns/${task.columnId}/tasks/${task.id}`,
        {
          name: formData.name,
          description: formData.description,
          dueDate: formData.dueDate,
        },
        {
          headers: {
            Authorization: `Bearer ${cookie.token}`,
          },
        }
      );

      onSave({
        ...task,
        name: response.data.name,
        description: response.data.description,
        due_date: response.data.dueDate,
        // is_active: response.data.isActive,
      });

      onClose();
    } catch (error) {
      console.error("Nie udało się zaktualizować zadania:", error);
      alert("Problem podczas aktualizacji zadania");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edytuj zadanie`}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-1">
            Nazwa zadania
          </label>
          <input
            id="name"
            type="text"
            name="name"
            placeholder="Enter task title..."
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded-md bg-gray-700 text-gray-100 p-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-1">
            Opis zadania
          </label>
          <textarea
            id="description"
            name="description"
            placeholder="Dodaj opis..."
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-md bg-gray-700 text-gray-100 p-2 border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
          />
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-1">
            Data zakończenia
          </label>
          <input
            id="dueDate"
            type="datetime-local"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className="w-full rounded-md bg-gray-700 text-gray-100 p-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="isActive"
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="h-4 w-4 accent-blue-600"
          />
          <label htmlFor="isActive" className="text-gray-300 text-sm">
            Wykonane?
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition"
          >
            Zapisz zmiany!
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskEditModal;
