import { useState, useEffect } from "react";
import Modal from "./Modal";
import axios from "axios";

const TaskEditModal = ({ task, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    due_date: "",
    is_active: true,
  });

  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name,
        description: task.description,
        dueDate: task.dueDate.split("T")[0],
        isActive: task.isActive,
      });
    }
  }, [task]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    try {
      await axios.put(`/api/tasks/${task.id}`, formData);
      onSave({ ...task, ...formData });
      onClose();
    } catch (err) {
      console.error(err);
      alert("Nie udało się dodać zadania.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Task`}>
      <div className="flex flex-col gap-3 text-gray-200">
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="p-2 rounded bg-gray-700 text-white"
          placeholder="Task Name"
        />
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="p-2 rounded bg-gray-700 text-white"
          placeholder="Description"
        />
        <input
          type="date"
          name="due_date"
          value={formData.due_date}
          onChange={handleChange}
          className="p-2 rounded bg-gray-700 text-white"
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
          />
          Active
        </label>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default TaskEditModal;
