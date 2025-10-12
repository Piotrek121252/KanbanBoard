import { useState, useEffect } from "react";
import Modal from "../Modal";
import { useCookies } from "react-cookie";
import axios from "axios";

const TaskAddModal = ({ columns, isOpen, onClose, onSave }) => {
  const [cookie] = useCookies("token");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    dueDate: "",
    columnId: "", // Domyślnie wybieramy pierwszą kolumnę
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        description: "",
        dueDate: "",
        columnId: columns.length > 0 ? columns[0].id : "",
      });
    }
  }, [isOpen, columns]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.columnId) return;

    try {
      const response = await axios.post(
        `http://localhost:8080/api/columns/${formData.columnId}/tasks`,
        {
          name: formData.name,
          description: formData.description,
          dueDate: formData.dueDate,
        },
        {
          headers: { Authorization: `Bearer ${cookie.token}` },
        }
      );

      onSave({
        ...response.data,
        columnId: formData.columnId,
      });

      onClose();
    } catch (error) {
      console.error("Nie udało się utworzyć zadania:", error);
      alert("Problem podczas tworzenia zadania");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Dodaj nowe zadanie">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <label className="block text-gray-300 text-sm font-medium mb-1">
          Nazwa zadania
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded-md bg-gray-700 text-gray-100 p-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </label>

        <label className="block text-gray-300 text-sm font-medium mb-1">
          Opis zadania
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-md bg-gray-700 text-gray-100 p-2 border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
          />
        </label>
        <label className="block text-gray-300 text-sm font-medium mb-1">
          Kolumna
          <select
            name="columnId"
            value={
              formData.columnId || (columns.length > 0 ? columns[0].id : "")
            }
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
          Data i czas zakończenia
          <input
            type="datetime-local"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className="w-full rounded-md bg-gray-700 text-gray-100 p-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </label>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition"
          >
            Dodaj zadanie
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskAddModal;
