import { useState, useEffect } from "react";
import Modal from "../Modal";
import axios from "axios";
import { useCookies } from "react-cookie";
import { COLUMN_COLORS } from "../../constants/columnColors";

const AddColumnModal = ({ boardId, columns, isOpen, onClose, onRefresh }) => {
  const [cookie] = useCookies(["token"]);
  const [formData, setFormData] = useState({
    name: "",
    position: 1,
    color: COLUMN_COLORS.find((c) => c.isDefault)?.color || "#4b5563",
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        position: columns.length + 1,
        color: COLUMN_COLORS.find((c) => c.isDefault)?.color || "#4b5563",
      });
    }
  }, [isOpen, columns]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "position" ? parseInt(value, 10) : value,
    }));
  };

  const handleColorSelect = (color) => {
    setFormData((prev) => ({ ...prev, color }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        `http://localhost:8080/api/boards/${boardId}/columns`,
        {
          name: formData.name,
          position: parseInt(formData.position, 10),
          color: formData.color,
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

        <label className="block text-gray-300 text-sm font-medium mb-1">
          Kolor kolumny
          <div className="flex gap-2 mt-1">
            {COLUMN_COLORS.map(({ color, isDefault }) => (
              <div key={color} className="relative">
                <button
                  type="button"
                  onClick={() => handleColorSelect(color)}
                  className={`w-8 h-8 rounded-full border-2 transition ${
                    formData.color === color
                      ? "border-white"
                      : "border-gray-600"
                  }`}
                  style={{ backgroundColor: color }}
                />
                {isDefault && (
                  <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-xs text-gray-400">
                    Default
                  </span>
                )}
              </div>
            ))}
          </div>
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
