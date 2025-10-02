import React, { useState } from "react";

const Kanban = () => {
  const [columns, setColumns] = useState({
    todo: {
      name: "To Do",
      items: [
        { id: "1", content: "Market research" },
        { id: "2", content: "Write Projects" },
      ],
    },
    inProgress: {
      name: "In Progress",
      items: [{ id: "3", content: "Design UI mockups" }],
    },
    done: { name: "Done", items: [{ id: "4", content: "Set up repository" }] },
  });

  const [newTask, setNewTask] = useState("");
  const [activeColumns, setActiveColumns] = useState("todo");
  const [draggedItem, setDraggedItem] = useState(null);

  const addNewTask = () => {
    if (newTask.trim() === "") return;

    const updatedColumns = { ...columns };

    updatedColumns[activeColumns].items.push({
      id: Date.now().toString(),
      content: newTask,
    });

    setColumns(updatedColumns);
    setNewTask("");
  };

  const removeTask = (columnId, taskId) => {
    const updatedColumns = { ...columns };

    updatedColumns[columnId].items = updatedColumns[columnId].items.filter(
      (item) => item.id !== taskId
    );

    setColumns(updatedColumns);
  };

  const handleDragStart = (columnId, item) => {
    setDraggedItem({ columnId, item });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, columnId) => {
    e.preventDefault();

    if (!draggedItem) return;

    const { columnId: sourceColumnId, item } = draggedItem;

    if (sourceColumnId === columnId) return;

    const updatedColumns = { ...columns };

    updatedColumns[sourceColumnId].items = updatedColumns[
      sourceColumnId
    ].items.filter((i) => i.id != item.id);

    updatedColumns[columnId].items.push(item);

    setColumns(updatedColumns);
    setDraggedItem(null);
  };

  const columnStyles = {
    todo: {
      header: "bg-gradient-to-r from-blue-600 to-blue-400",
      boarder: "boarder-blue-400",
    },
    inProgress: {
      header: "bg-gradient-to-r from-yellow-600 to-yellow-400",
      boarder: "boarder-yellow-400",
    },
    done: {
      header: "bg-gradient-to-r from-green-600 to-green-400",
      boarder: "boarder-green-400",
    },
  };

  return (
    <>
      <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-b from-zinc-900 to-zinc-800 p-6">
        <div className="flex w-full max-w-6xl flex-col items-center justify-center gap-4">
          <h1 className="bg-gradient-to-r from-yellow-400 mb-8 via-amber-500 to-rose-400 bg-clip-text text-6xl font-bold text-transparent">
            TaskFlow - Kanban Board
          </h1>
          <div className="mb-8 flex w-full max-w-lg overflow-hidden rounded-lg shadow-lg">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add a new task..."
              className="flex-grow bg-zinc-700 p-3 text-white"
              onKeyDown={(e) => e.key === "Enter" && addNewTask()}
            />

            <select
              value={activeColumns}
              onChange={(e) => setActiveColumns(e.target.value)}
              className="border-0 border-l border-zinc-600 bg-zinc-700 p-3 text-white"
            >
              {Object.keys(columns).map((columnId) => (
                <option value={columnId} key={columnId}>
                  {columns[columnId].name}
                </option>
              ))}
            </select>

            <button
              onClick={addNewTask}
              className="tansition-all cursor-pointer bg-gradient-to-r from-yellow-600 to-amber-500
               px-6 font-medium text-white duration-200 hover:from-yellow-500 hover:to-amber-500"
            >
              Add
            </button>
          </div>
          <div className="flex gap-6 overflow-x-auto, pb-6 w-full">
            {Object.keys(columns).map((columnId) => (
              <div
                key={columnId}
                className={`flex-shrink-0 w-80 bg-zinc-800 rounded-lg
              shadow-xl boarder-t-4 ${columnStyles[columnId.border]}`}
                onDragOver={(e) => handleDragOver(e, columnId)}
                onDrop={(e) => handleDrop(e, columnId)}
              >
                <div
                  className={`p-4 text-white font-bold text-xl rounded-t-md ${columnStyles[columnId].header}`}
                >
                  {columns[columnId].name}
                  <span className="ml-2 px-2 py-1 bg-zinc-800 bg-opacity-30 rounded-full text-sm">
                    {columns[columnId].items.length}
                  </span>
                </div>
                <div className="p-3 min-h-64">
                  {columns[columnId].items.length === 0 ? (
                    <div className="text-center py-10 text-zinc-500 italic text-sm">
                      Drop tasks here
                    </div>
                  ) : (
                    columns[columnId].items.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 mb-3
                    bg-zinc-700 text-white rounded-lg shadow-md
                      cursor-move flex items-center justify-between
                      transform transition-all duration-200
                      hover:scale-105 hover:shadow-lg"
                        draggable
                        onDragStart={() => handleDragStart(columnId, item)}
                      >
                        <span className="mr-2">{item.content}</span>
                        <button
                          onClick={() => removeTask(columnId, item.id)}
                          className="text-zinc-400 hover:text-red-400 transition-colors
                          duration-200 w-6 h-6 flex items-center justify-center rounded-full
                          hover:bg-zinc-600"
                        >
                          <span className="text-lg cursor-pointer">x</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Kanban;
