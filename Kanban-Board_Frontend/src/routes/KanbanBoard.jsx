import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import axios from "axios";
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  closestCorners,
  DragOverlay,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import Column from "../components/Kanban/Column";
import TaskOverlay from "../components/Kanban/TaskOverlay";
import TaskEditModal from "../components/Kanban/TaskEditModal";
import TaskAddModal from "../components/Kanban/TaskAddModal";
import TaskPreviewModal from "../components/Kanban/TaskPreviewModal";
import { useParams } from "react-router-dom";

const KanbanBoard = () => {
  const { id: boardId } = useParams();
  const [addModalColumnId, setAddModalColumnId] = useState(null);
  const [previewTask, setPreviewTask] = useState(null);
  const [boardName, setBoardName] = useState("");
  const [cookie] = useCookies(["token"]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [columns, setColumns] = useState([]);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    const fetchBoardData = async () => {
      try {
        const boardRes = await axios.get(
          `http://localhost:8080/api/boards/${boardId}`,
          {
            headers: {
              Authorization: `Bearer ${cookie.token}`,
            },
          }
        );

        setBoardName(boardRes.data.name);

        const columnsRes = await axios.get(
          `http://localhost:8080/api/boards/${boardId}/columns`,
          {
            headers: {
              Authorization: `Bearer ${cookie.token}`,
            },
          }
        );
        const columnsData = columnsRes.data;

        const tasksRes = await Promise.all(
          columnsData.map((col) =>
            axios
              .get(`http://localhost:8080/api/columns/${col.id}/tasks`, {
                headers: {
                  Authorization: `Bearer ${cookie.token}`,
                },
              })
              .then((res) => ({
                columnId: col.id,
                tasks: res.data,
              }))
          )
        );
        const columnsWithTasks = columnsData.map((col) => {
          const taskObj = tasksRes.find((t) => t.columnId === col.id);
          return {
            id: col.id.toString(),
            title: col.name,
            items: taskObj ? taskObj.tasks : [],
          };
        });

        setColumns(columnsWithTasks);
      } catch (err) {
        console.error("Nie udało się pobrać danych z tablicy:", err);
      }
    };

    if (cookie.token) fetchBoardData();
  }, [boardId, cookie.token]);

  // Sensory dla drag and drop
  const sensors = useSensors(
    // Obsługa myszki/dotyk
    useSensor(PointerSensor, {
      activationConstraint: { delay: 100, tolerance: 5 },
    }),
    // Obsługa klawiatury
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const findColumnId = (id) => {
    if (columns.some((c) => c.id === id)) return id; // it's a column itself
    return columns.find((c) => c.items.some((i) => i.id === id))?.id;
  };

  const handleTaskPreview = (task) => setPreviewTask(task);

  const handleDeleteTask = async (taskId, columnId) => {
    try {
      await axios.delete(
        `http://localhost:8080/api/columns/${columnId}/tasks/${taskId}`,
        {
          headers: { Authorization: `Bearer ${cookie.token}` },
        }
      );

      setColumns((prev) =>
        prev.map((col) =>
          col.id === columnId
            ? { ...col, items: col.items.filter((t) => t.id !== taskId) }
            : col
        )
      );
    } catch (err) {
      console.error("Nie udało się usunąć zadania:", err);
      alert("Nie udało się usunąć zadania");
    }
  };

  const handleDragStart = (event) => setActiveId(event.active.id);
  const handleDragCancel = () => setActiveId(null);

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;
    const activeCol = findColumnId(activeId);
    const overCol = findColumnId(overId);
    if (!activeCol || !overCol || activeCol === overCol) return;

    setColumns((prev) => {
      const fromCol = prev.find((c) => c.id === activeCol);
      const task = fromCol.items.find((i) => i.id === activeId);

      return prev.map((col) => {
        if (col.id === activeCol)
          return { ...col, items: col.items.filter((i) => i.id !== activeId) };
        if (col.id === overCol) return { ...col, items: [...col.items, task] };
        return col;
      });
    });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return setActiveId(null);

    const activeCol = findColumnId(active.id);
    const overCol = findColumnId(over.id);
    if (!activeCol || !overCol) return;

    if (activeCol === overCol && active.id !== over.id) {
      setColumns((prev) =>
        prev.map((c) => {
          if (c.id !== activeCol) return c;
          const oldIndex = c.items.findIndex((i) => i.id === active.id);
          const newIndex = c.items.findIndex((i) => i.id === over.id);
          return { ...c, items: arrayMove(c.items, oldIndex, newIndex) };
        })
      );
    }

    setActiveId(null);
  };

  const getActiveTask = () =>
    columns.flatMap((c) => c.items).find((i) => i.id === activeId);

  return (
    <div className="p-6 pt-20 min-h-screen bg-gray-900 text-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">
          {boardName || "Ładowanie tablicy..."}
        </h1>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-md py-1 px-3"
          onClick={() => setAddModalColumnId(columns[0]?.id)}
        >
          + Dodaj nowe zadanie
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragCancel={handleDragCancel}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {columns.map((col) => (
            <Column
              key={col.id}
              id={col.id}
              title={col.title}
              items={col.items}
              onTaskClick={setSelectedTask}
              onTaskDelete={handleDeleteTask}
              onTaskPreview={handleTaskPreview}
            />
          ))}
        </div>

        <DragOverlay
          dropAnimation={{
            duration: 150,
            easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
          }}
        >
          {activeId ? <TaskOverlay task={getActiveTask()} /> : null}
        </DragOverlay>
      </DndContext>
      <TaskEditModal
        columns={columns}
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onSave={(updatedTask) => {
          setColumns((prev) =>
            prev.map((col) => ({
              ...col,
              items: col.items.map((t) =>
                t.id === updatedTask.id ? updatedTask : t
              ),
            }))
          );
        }}
      />
      <TaskAddModal
        columns={columns}
        isOpen={!!addModalColumnId}
        onClose={() => setAddModalColumnId(null)}
        onSave={(newTask) => {
          setColumns((prev) =>
            prev.map((col) =>
              col.id === newTask.columnId
                ? { ...col, items: [...col.items, newTask] }
                : col
            )
          );
        }}
      />
      <TaskPreviewModal
        task={previewTask}
        isOpen={!!previewTask}
        onClose={() => setPreviewTask(null)}
      />
      <TaskPreviewModal
        task={previewTask}
        isOpen={!!previewTask}
        onClose={() => setPreviewTask(null)}
      />
    </div>
  );
};

export default KanbanBoard;
