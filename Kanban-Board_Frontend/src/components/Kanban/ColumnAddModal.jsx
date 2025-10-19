import { useState, useEffect } from "react";
import Modal from "../Modal";
import axios from "axios";
import { useCookies } from "react-cookie";

const AddColumnModal = ({ boardId, columns, isOpen, onClose, onRefresh }) => {
  const [cookie] = useCookies(["token"]);
  const [formData, setFormData] = useState({ name: "", position: 1 });

  useEffect(() => {
    if (isOpen) {
      setFormData({ name: "", position: columns.length + 1 });
    }
  }, [isOpen, columns]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        `http://localhost:8080/api/boards/${boardId}/columns`,
        {
          name: formData.name,
          position: parseInt(formData.position, 10),
        },
        { headers: { Authorization: `Bearer ${cookie.token}` } }
      );
      onClose();
      onRefresh();
    } catch (error) {
      console.error("Nie udało się dodać kolumny:", error);
      alert("Wystąpił problem podczas dodawania kolumny.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Dodaj nową kolumnę">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="block text-gray-300 text-sm font-medium mb-1">
          Nazwa kolumny
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Wpisz nazwę kolumny..."
            className="w-full rounded-md bg-gray-700 text-gray-100 p-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
            required
          />
        </label>

        <label className="block text-gray-300 text-sm font-medium mb-1">
          Pozycja kolumny
          <select
            name="position"
            value={formData.position}
            onChange={handleChange}
            className="w-full rounded-md bg-gray-700 text-gray-100 p-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            {Array.from({ length: columns.length + 1 }).map((_, index) => (
              <option key={index + 1} value={index + 1}>
                {index + 1}
              </option>
            ))}
          </select>
        </label>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition"
          >
            Dodaj kolumnę
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddColumnModal;
