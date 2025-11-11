import React, { useState, useEffect, useCallback } from "react";
import { useCookies } from "react-cookie";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";

const TimeSummaryPage = ({ boardMembers }) => {
  const { id: boardId } = useParams();
  const [cookie] = useCookies(["token"]);
  const [summary, setSummary] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});
  const navigate = useNavigate();

  const fetchSummary = useCallback(async () => {
    if (!cookie.token) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:8080/api/boards/${boardId}/time-entries/summary`,
        {
          headers: { Authorization: `Bearer ${cookie.token}` },
          params: {
            userId: selectedUserId,
            month,
            year,
          },
        }
      );
      setSummary(res.data);
    } catch (err) {
      console.error("Failed to fetch summary:", err);
      setSummary([]);
    } finally {
      setLoading(false);
    }
  }, [boardId, cookie.token, selectedUserId, month, year]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const formatTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  const toggleRow = (taskId, userId) => {
    const key = `${taskId}-${userId}`;
    setExpandedRows((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="p-6 pt-20 bg-gray-900 min-h-screen">
      <button
        onClick={() => navigate(`/boards/${boardId}/kanban`)}
        className="mb-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
      >
        Powrót do Kanban
      </button>

      <div className="mb-4 flex gap-2 items-center">
        <select
          value={selectedUserId || ""}
          onChange={(e) =>
            setSelectedUserId(e.target.value ? Number(e.target.value) : null)
          }
          className="p-2 rounded-md bg-gray-700 text-gray-100"
        >
          <option value="">Wszyscy użytkownicy</option>
          {boardMembers?.map((m) => (
            <option key={m.userId} value={m.userId}>
              {m.username}
            </option>
          ))}
        </select>

        <input
          type="number"
          min="2000"
          max="2100"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="p-2 rounded-md bg-gray-700 text-gray-100 w-24"
        />
        <input
          type="number"
          min="1"
          max="12"
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="p-2 rounded-md bg-gray-700 text-gray-100 w-20"
        />

        <button
          onClick={fetchSummary}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
        >
          Pobierz
        </button>
      </div>

      {loading ? (
        <p>Ładowanie danych...</p>
      ) : summary.length === 0 ? (
        <p>Brak danych dla wybranego okresu</p>
      ) : (
        <div className="overflow-auto">
          <table className="w-full text-sm text-left text-gray-300 min-w-[640px] border border-gray-700 rounded-md overflow-hidden">
            <thead className="bg-gray-700 text-gray-200 uppercase text-xs tracking-wide">
              <tr>
                <th className="px-3 py-2">Zadanie</th>
                <th className="px-3 py-2">Użytkownik</th>
                <th className="px-3 py-2">Łączny czas</th>
                <th className="px-3 py-2 text-right">Szczegóły</th>
              </tr>
            </thead>
            <tbody>
              {summary
                .reduce((acc, entry) => {
                  // Group by task
                  const taskGroup = acc.find((t) => t.taskId === entry.taskId);
                  if (taskGroup) {
                    taskGroup.users.push(entry);
                  } else {
                    acc.push({
                      taskId: entry.taskId,
                      taskName: entry.taskName,
                      users: [entry],
                    });
                  }
                  return acc;
                }, [])
                .map((task) => (
                  <React.Fragment key={task.taskId}>
                    <tr className="bg-gray-800 font-semibold">
                      <td className="px-3 py-2">{task.taskName}</td>
                      <td className="px-3 py-2" colSpan={3}></td>
                    </tr>
                    {task.users.map((userEntry) => {
                      const key = `${task.taskId}-${userEntry.userId}`;
                      const expanded = expandedRows[key];
                      return (
                        <React.Fragment key={key}>
                          <tr
                            className="border-t border-gray-700 hover:bg-gray-800 cursor-pointer"
                            onClick={() =>
                              toggleRow(task.taskId, userEntry.userId)
                            }
                          >
                            <td></td>
                            <td className="px-3 py-2">{userEntry.username}</td>
                            <td className="px-3 py-2">
                              {formatTime(userEntry.totalMinutesSpent)}
                            </td>
                            <td className="px-3 py-2 text-right">
                              {expanded ? (
                                <FaChevronDown />
                              ) : (
                                <FaChevronRight />
                              )}
                            </td>
                          </tr>
                          {expanded &&
                            userEntry.entries.map((e) => (
                              <tr
                                key={e.id}
                                className="bg-gray-800 border-t border-gray-700 text-sm text-gray-400"
                              >
                                <td></td>
                                <td></td>
                                <td className="px-3 py-2">
                                  {formatTime(e.minutesSpent)}
                                </td>
                                <td className="px-3 py-2">
                                  {new Date(e.entryDate).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                        </React.Fragment>
                      );
                    })}
                  </React.Fragment>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TimeSummaryPage;
