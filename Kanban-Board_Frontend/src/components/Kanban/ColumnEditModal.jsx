import { useState, useEffect } from "react";
import Modal from "../Modal";
import axios from "axios";
import { useCookies } from "react-cookie";

const ColumnEditModal = ({
  column,
  columns,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const [cookie] = useCookies(["token"]);
  const [formData, setFormData] = useState({ name: "", position: 1 });

  useEffect(() => {
    if (isOpen && column) {
      setFormData({
        name: column.title || "",
        position: column.position || 1,
      });
    }
  }, [isOpen, column]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "position" ? parseInt(value, 10) : value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!column) return;

    try {
      const response = await axios.put(
        `http://localhost:8080/api/boards/${column.boardId}/columns/${column.id}`,
        { name: formData.name, position: formData.position },
        {
          headers: { Authorization: `Bearer ${cookie.token}` },
        }
      );

      onSave({
        ...column,
        title: response.data.name,
        position: formData.position,
      });
      onClose();
    } catch (error) {
      console.error("Nie udało się zaktualizować kolumny:", error);
      alert("Problem podczas aktualizacji kolumny");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Czy na pewno chcesz usunąć tę kolumnę?")) return;

    try {
      await axios.delete(
        `http://localhost:8080/api/boards/${column.boardId}/columns/${column.id}`,
        {
          headers: { Authorization: `Bearer ${cookie.token}` },
        }
      );

      onDelete(column.id);
      onClose();
    } catch (error) {
      console.error("Nie udało się usunąć kolumny:", error);
      alert("Problem podczas usuwania kolumny");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edytuj kolumnę">
      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <label className="block text-gray-300 text-sm font-medium mb-1">
          Nazwa kolumny
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Wpisz nową nazwę kolumny..."
            className="w-full rounded-md bg-gray-700 text-gray-100 p-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
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
            {Array.from({ length: columns.length }).map((_, index) => (
              <option key={index + 1} value={index + 1}>
                {index + 1}
              </option>
            ))}
          </select>
        </label>

        <div className="flex justify-between items-center mt-4">
          <button
            type="button"
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md transition"
          >
            Usuń kolumnę
          </button>

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

export default ColumnEditModal;
