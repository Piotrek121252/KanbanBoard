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

const KanbanBoard = () => {
  const { id: boardId } = useParams();
  const [addModalColumnId, setAddModalColumnId] = useState(null);
  const [previewTask, setPreviewTask] = useState(null);
  const [boardName, setBoardName] = useState("");
  const [cookie] = useCookies(["token"]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [columns, setColumns] = useState([]);
  const [activeId, setActiveId] = useState(null);
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
            .then((res) => ({ columnId: col.id, tasks: res.data }))
        )
      );

      const columnsWithTasks = columnsData
        .map((col) => {
          const taskObj = tasksRes.find((t) => t.columnId === col.id);
          return {
            id: col.id.toString(),
            title: col.name,
            boardId,
            position: col.position,
            items: taskObj ? taskObj.tasks : [],
          };
        })
        .sort((a, b) => a.position - b.position);

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
      activationConstraint: { delay: 100, tolerance: 5 },
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

  const handleDragStart = (event) => setActiveId(event.active.id);
  const handleDragCancel = () => setActiveId(null);

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;
    const activeCol = findColumnId(active.id);
    const overCol = findColumnId(over.id);
    if (!activeCol || !overCol || activeCol === overCol) return;

    setColumns((prev) => {
      const fromCol = prev.find((c) => c.id === activeCol);
      const task = fromCol.items.find((i) => i.id === active.id);
      return prev.map((col) => {
        if (col.id === activeCol)
          return { ...col, items: col.items.filter((i) => i.id !== active.id) };
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
                  boardId={col.boardId}
                  onTaskEdit={setSelectedTask}
                  onTaskDelete={handleDeleteTask}
                  onTaskPreview={handleTaskPreview}
                  onEdit={() => {
                    setSelectedColumn(col);
                    setIsEditColumnOpen(true);
                  }}
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
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onRefresh={fetchBoardData}
      />
      <TaskAddModal
        columns={columns}
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
