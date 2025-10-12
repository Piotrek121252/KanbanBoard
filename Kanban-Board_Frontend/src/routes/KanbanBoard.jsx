import React, { useState } from "react";
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

const KanbanBoard = () => {
  const [columns, setColumns] = useState([
    {
      id: "todo",
      title: "To Do",
      items: [
        { id: "1", content: "Task1" },
        { id: "2", content: "Task2" },
      ],
    },
    {
      id: "in-progress",
      title: "In Progress",
      items: [{ id: "3", content: "Task3" }],
    },
    {
      id: "done",
      title: "Done",
      items: [{ id: "4", content: "Task4" }],
    },
  ]);

  const [activeId, setActiveId] = useState(null);

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

    const col = findColumnId(active.id);
    const overCol = findColumnId(over.id);
    if (!col || !overCol) return;

    if (col === overCol && active.id !== over.id) {
      setColumns((prev) =>
        prev.map((c) => {
          if (c.id !== col) return c;
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
      <h1 className="text-2xl font-semibold mb-4">Kanban Board</h1>

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
            />
          ))}
        </div>

        <DragOverlay>
          {activeId ? (
            <TaskOverlay>{getActiveTask()?.content}</TaskOverlay>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default KanbanBoard;
