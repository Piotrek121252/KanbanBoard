import React, { useCallback, useEffect, useState } from "react";
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
import ColumnAddModal from "../components/Kanban/ColumnAddModal";
import ColumnEditModal from "../components/Kanban/ColumnEditModal";
import { useParams } from "react-router-dom";

const COLUMN_COLORS = [
  { color: "#3730a3" }, // Dark Indigo
  { color: "#15803d" }, // Dark Green
  { color: "#b91c1c" }, // Dark Red
  { color: "#b45309" }, // Dark Amber
  { color: "#0369a1" }, // Dark Blue
  { color: "#4b5563", isDefault: true }, // Dark Gray — default
];

const KanbanBoard = () => {
  const { id: boardId } = useParams();
  const [addModalColumnId, setAddModalColumnId] = useState(null);
  const [previewTask, setPreviewTask] = useState(null);
  const [boardName, setBoardName] = useState("");
  const [cookie] = useCookies(["token"]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [columns, setColumns] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [originalColumnId, setOriginalColumnId] = useState(null);
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [isEditColumnOpen, setIsEditColumnOpen] = useState(false);

  const fetchBoardData = useCallback(async () => {
    try {
      const boardRes = await axios.get(
        `http://localhost:8080/api/boards/${boardId}`,
        { headers: { Authorization: `Bearer ${cookie.token}` } }
      );
      setBoardName(boardRes.data.name);

      const columnsRes = await axios.get(
        `http://localhost:8080/api/boards/${boardId}/columns`,
        { headers: { Authorization: `Bearer ${cookie.token}` } }
      );
      const columnsData = columnsRes.data;

      const tasksRes = await Promise.all(
        columnsData.map((col) =>
          axios
            .get(`http://localhost:8080/api/columns/${col.id}/tasks`, {
              headers: { Authorization: `Bearer ${cookie.token}` },
            })
            .then((res) => ({
              columnId: col.id,
              tasks: res.data, //.sort((a, b) => a.position - b.position)
            }))
        )
      );

      const columnsWithTasks = columnsData.map((col) => {
        const taskObj = tasksRes.find((t) => t.columnId === col.id);
        return {
          id: col.id.toString(),
          title: col.name,
          boardId,
          position: col.position,
          color: col.color,
          items: taskObj ? taskObj.tasks : [],
        };
      });
      // .sort((a, b) => a.position - b.position);

      setColumns(columnsWithTasks);
    } catch (err) {
      console.error("Nie udało się pobrać danych z tablicy:", err);
    }
  }, [boardId, cookie.token]);

  useEffect(() => {
    if (cookie.token) fetchBoardData();
  }, [boardId, cookie.token, fetchBoardData]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 125, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const findColumnId = (id) => {
    if (columns.some((c) => c.id === id)) return id;
    return columns.find((c) => c.items.some((i) => i.id === id))?.id;
  };

  const handleTaskPreview = (task) => setPreviewTask(task);

  const handleDeleteTask = async (taskId, columnId) => {
    try {
      await axios.delete(
        `http://localhost:8080/api/columns/${columnId}/tasks/${taskId}`,
        { headers: { Authorization: `Bearer ${cookie.token}` } }
      );
      await fetchBoardData();
    } catch (err) {
      console.error("Nie udało się usunąć zadania:", err);
      alert("Nie udało się usunąć zadania");
    }
  };

  const handleToggleTaskActive = async (task) => {
    try {
      await axios.patch(
        `http://localhost:8080/api/columns/${task.columnId}/tasks/${task.id}/active`,
        { isActive: !task.isActive },
        { headers: { Authorization: `Bearer ${cookie.token}` } }
      );

      await fetchBoardData();
    } catch (err) {
      console.error("Nie udało się zmienić statusu zadania:", err);
      alert("Błąd: Nie udało się zmienić statusu zadania");
      await fetchBoardData();
    }
  };

  const handleDragStart = (event) => {
    const { id } = event.active;
    setActiveId(id);
    setOriginalColumnId(findColumnId(id));
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setOriginalColumnId(null);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;
    const activeCol = findColumnId(active.id);
    const overCol = findColumnId(over.id);
    if (!activeCol || !overCol || activeCol === overCol) return;

    setColumns((prev) => {
      const fromCol = prev.find((c) => c.id === activeCol);
      if (!fromCol) return prev;
      const task = fromCol.items.find((i) => i.id === active.id);
      if (!task) return prev;

      return prev.map((col) => {
        if (col.id === activeCol)
          return { ...col, items: col.items.filter((i) => i.id !== active.id) };
        if (col.id === overCol) return { ...col, items: [...col.items, task] };
        return col;
      });
    });
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    const resetDragState = () => {
      setActiveId(null);
      setOriginalColumnId(null);
    };

    if (!over) {
      resetDragState();
      return;
    }

    const taskId = active.id;
    const overId = over.id;

    const overColId = findColumnId(overId);

    if (!originalColumnId || !overColId) {
      resetDragState();
      return;
    }

    if (active.id === over.id && originalColumnId === overColId) {
      resetDragState();
      return;
    }

    const currentColumn = columns.find((c) => c.id === overColId);
    if (!currentColumn) {
      await fetchBoardData();
      resetDragState();
      return;
    }

    const oldIdx = currentColumn.items.findIndex((i) => i.id === taskId);

    let newIdx = currentColumn.items.findIndex((i) => i.id === overId);

    if (newIdx === -1) {
      newIdx = currentColumn.items.length - 1;
    }

    if (oldIdx === -1) {
      console.error(
        "Nie znaleziono zadania w kolumnie po optymistycznym update."
      );
      await fetchBoardData();
      resetDragState();
      return;
    }

    setColumns((prev) =>
      prev.map((c) => {
        if (c.id === overColId) {
          return { ...c, items: arrayMove(c.items, oldIdx, newIdx) };
        }
        return c;
      })
    );

    try {
      await axios.patch(
        `http://localhost:8080/api/columns/${originalColumnId}/tasks/${taskId}/position`,
        {
          newColumnId: Number(overColId),
          newIndex: newIdx,
        },
        { headers: { Authorization: `Bearer ${cookie.token}` } }
      );

      // await fetchBoardData();
    } catch (err) {
      console.error("Nie udało się zaktualizować pozycji zadania:", err);
      alert("Błąd: Nie udało się zapisać nowej pozycji. Przywracanie stanu.");
      await fetchBoardData();
    }

    resetDragState();
  };

  const getActiveTask = () =>
    columns.flatMap((c) => c.items).find((i) => i.id === activeId);

  const handleMoveColumn = async (columnId, delta) => {
    const index = columns.findIndex((c) => c.id === columnId);
    const newIndex = index + delta;

    if (newIndex < 0 || newIndex >= columns.length) return;

    setColumns((prev) => arrayMove(prev, index, newIndex));

    try {
      await axios.patch(
        `http://localhost:8080/api/boards/${boardId}/columns/${columnId}/position`,
        { newPosition: newIndex + 1 },
        { headers: { Authorization: `Bearer ${cookie.token}` } }
      );
      await fetchBoardData();
    } catch (err) {
      console.error("Nie udało się zmienić pozycji kolumny:", err);
      alert("Błąd: Nie udało się zmienić pozycji kolumny");
      await fetchBoardData();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100 pt-20">
      <div className="flex justify-between items-center mb-4 px-6">
        <h1 className="text-2xl font-semibold">
          {boardName || "Ładowanie tablicy..."}
        </h1>

        <div className="flex gap-2">
          <button
            onClick={() => setIsAddColumnOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-md py-2 px-4 font-medium transition"
          >
            + Dodaj kolumnę
          </button>
          <button
            onClick={() => setAddModalColumnId(columns[0]?.id)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-md py-2 px-4 font-medium transition"
          >
            + Dodaj zadanie
          </button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragCancel={handleDragCancel}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-x-auto overflow-y-auto">
          <div className="flex gap-4 h-full">
            {columns.map((col) => (
              <div key={col.id} className="flex-shrink-0 w-80">
                <Column
                  id={col.id}
                  title={col.title}
                  items={col.items}
                  color={col.color}
                  boardId={col.boardId}
                  onTaskEdit={setSelectedTask}
                  onTaskDelete={handleDeleteTask}
                  onTaskPreview={handleTaskPreview}
                  onTaskToggleActive={handleToggleTaskActive}
                  onEdit={() => {
                    setSelectedColumn(col);
                    setIsEditColumnOpen(true);
                  }}
                  onMoveLeft={col.position > 1 ? handleMoveColumn : undefined}
                  onMoveRight={
                    col.position < columns.length ? handleMoveColumn : undefined
                  }
                  isFirst={col.position === 1}
                  isLast={col.position === columns.length}
                />
              </div>
            ))}
          </div>
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

      {/* Miejsce na modale*/}
      <TaskEditModal
        columns={columns}
        columnColors={COLUMN_COLORS}
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onRefresh={fetchBoardData}
      />
      <TaskAddModal
        columns={columns}
        columnColors={COLUMN_COLORS}
        isOpen={!!addModalColumnId}
        onClose={() => setAddModalColumnId(null)}
        onSave={fetchBoardData}
      />
      <TaskPreviewModal
        task={previewTask}
        isOpen={!!previewTask}
        onClose={() => setPreviewTask(null)}
      />
      <ColumnAddModal
        boardId={boardId}
        columns={columns}
        isOpen={isAddColumnOpen}
        onClose={() => setIsAddColumnOpen(false)}
        onRefresh={fetchBoardData}
      />
      <ColumnEditModal
        column={selectedColumn}
        columns={columns}
        isOpen={isEditColumnOpen}
        onClose={() => setIsEditColumnOpen(false)}
        onRefresh={fetchBoardData}
      />
    </div>
  );
};

export default KanbanBoard;
