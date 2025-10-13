import { useState, useEffect } from "react";
import Modal from "../Modal";
import axios from "axios";
import { useCookies } from "react-cookie";

const ColumnEditModal = ({ column, isOpen, onClose, onSave, onDelete }) => {
  const [cookie] = useCookies(["token"]);
  const [formData, setFormData] = useState({
    name: "",
  });

  useEffect(() => {
    if (isOpen && column) {
      setFormData({ name: column.title || "" });
    }
  }, [isOpen, column]);

  const handleChange = (e) => {
    const { value } = e.target;
    setFormData({ name: value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!column) return;

    try {
      const response = await axios.put(
        `http://localhost:8080/api/boards/${column.boardId}/columns/${column.id}`,
        { name: formData.name, position: column.position },
        {
          headers: {
            Authorization: `Bearer ${cookie.token}`,
          },
        }
      );

      onSave({
        ...column,
        title: response.data.name,
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
          headers: {
            Authorization: `Bearer ${cookie.token}`,
          },
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
