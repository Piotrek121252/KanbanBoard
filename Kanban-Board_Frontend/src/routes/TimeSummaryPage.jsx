import React, { useState, useEffect, useCallback } from "react";
import { useCookies } from "react-cookie";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";

const TimeSummaryPage = ({ boardMembers }) => {
  const { id: boardId } = useParams();
  const [cookie] = useCookies(["token"]);
  const [summary, setSummary] = useState([]);
  const [usersWithTime, setUsersWithTime] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [appliedMonth, setAppliedMonth] = useState(month);
  const [appliedYear, setAppliedYear] = useState(year);
  const [appliedUserId, setAppliedUserId] = useState(selectedUserId);
  const [loading, setLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});
  const [dataFetched, setDataFetched] = useState(false);
  const navigate = useNavigate();

  const fetchSummary = useCallback(
    async (params) => {
      if (!cookie.token) return;
      setLoading(true);
      try {
        const res = await axios.get(
          `http://localhost:8080/api/boards/${boardId}/time-entries/summary`,
          {
            headers: { Authorization: `Bearer ${cookie.token}` },
            params: params || {
              userId: appliedUserId,
              month: appliedMonth,
              year: appliedYear,
            },
          }
        );
        setSummary(res.data);
        setDataFetched(true);
      } catch (err) {
        console.error("Nie udało się pobrać podsumowania.", err);
        setSummary([]);
      } finally {
        setLoading(false);
      }
    },
    [boardId, cookie.token, appliedUserId, appliedMonth, appliedYear]
  );

  const fetchUsersWithTime = useCallback(async () => {
    if (!cookie.token) return;
    try {
      const res = await axios.get(
        `http://localhost:8080/api/boards/${boardId}/time-entries/users`,
        {
          headers: { Authorization: `Bearer ${cookie.token}` },
        }
      );

      setUsersWithTime(res.data);
    } catch (err) {
      console.error("Nie udało się pobrać użytkowników do podsumowania:", err);
    }
  }, [boardId, cookie.token]);

  useEffect(() => {
    if (appliedMonth && appliedYear) {
      fetchSummary();
    }
  }, [fetchSummary, appliedMonth, appliedYear, appliedUserId]);

  useEffect(() => {
    fetchUsersWithTime();
  }, [fetchUsersWithTime]);

  const formatTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  const toggleRow = (taskId, userId) => {
    const key = `${taskId}-${userId}`;
    setExpandedRows((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getMonthName = (m) =>
    new Date(0, m - 1).toLocaleString("pl-PL", { month: "long" });

  const handleFetchClick = () => {
    setAppliedMonth(month);
    setAppliedYear(year);
    setAppliedUserId(selectedUserId);
  };

  return (
    <div className="p-6 pt-20 bg-gray-900 min-h-screen">
      <button
        onClick={() => navigate(`/boards/${boardId}/kanban`)}
        className="mb-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
      >
        Powrót do Kanban
      </button>

      <div className="mb-6 flex flex-wrap items-end gap-4 bg-gray-800 p-4 rounded-lg shadow">
        <div className="flex flex-col">
          <label className="text-gray-300 text-sm font-semibold mb-1">
            Użytkownik
          </label>
          <select
            value={selectedUserId || ""}
            onChange={(e) =>
              setSelectedUserId(e.target.value ? Number(e.target.value) : null)
            }
            className="p-2 rounded-md bg-gray-700 text-gray-100 min-w-[180px]"
          >
            <option value="">Wszyscy użytkownicy</option>
            {usersWithTime.map((u) => (
              <option key={u.id} value={u.id}>
                {u.username} {u.isCurrentMember ? "" : "▪ BYŁY CZŁONEK"}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-gray-300 text-sm font-semibold mb-1">
            Rok
          </label>
          <input
            type="number"
            min="2000"
            max="2100"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="p-2 rounded-md bg-gray-700 text-gray-100 w-24"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-gray-300 text-sm font-semibold mb-1">
            Miesiąc
          </label>
          <input
            type="number"
            min="1"
            max="12"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="p-2 rounded-md bg-gray-700 text-gray-100 w-24"
          />
        </div>

        <button
          onClick={handleFetchClick}
          className="ml-auto px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-semibold transition"
        >
          Pobierz dane
        </button>
      </div>

      {dataFetched && (
        <h2 className="text-lg font-semibold text-gray-100 mb-3">
          Podsumowanie czasu pracy —
          <span className="text-blue-400 ml-1">
            {getMonthName(appliedMonth)} {appliedYear}
          </span>
          <span className="text-gray-400 mx-2">•</span>
          <span className="text-yellow-400">
            {appliedUserId
              ? usersWithTime.find((u) => u.id === appliedUserId)?.username
              : "Wszyscy użytkownicy"}
          </span>
        </h2>
      )}

      {loading ? (
        <p className="text-gray-400">Ładowanie danych...</p>
      ) : !dataFetched ? (
        <p className="text-gray-400">
          Wybierz parametry i kliknij{" "}
          <span className="font-semibold text-gray-200">Pobierz dane</span>, aby
          zobaczyć podsumowanie.
        </p>
      ) : summary.length === 0 ? (
        <p className="text-gray-400">Brak danych dla wybranego okresu.</p>
      ) : (
        <div className="overflow-auto mt-4">
          <table className="w-full text-sm text-left text-gray-300 border border-gray-700 rounded-md overflow-hidden">
            <thead className="bg-gray-700 text-gray-200 uppercase text-xs tracking-wide sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2 w-8"></th>
                <th className="px-3 py-2">Zadanie</th>
                <th className="px-3 py-2">Użytkownik</th>
                <th className="px-3 py-2">Łączny czas</th>
                <th className="px-3 py-2">Normalne godziny</th>
                <th className="px-3 py-2">Nadgodziny</th>
              </tr>
            </thead>
            <tbody>
              {summary.map((entry) => {
                const key = `${entry.taskId}-${entry.userId}`;
                const expanded = expandedRows[key];
                return (
                  <React.Fragment key={key}>
                    <tr
                      className="border-t border-gray-700 hover:bg-gray-800 cursor-pointer"
                      onClick={() => toggleRow(entry.taskId, entry.userId)}
                    >
                      <td className="px-3 py-2 text-gray-400">
                        {expanded ? <FaChevronDown /> : <FaChevronRight />}
                      </td>
                      <td className="px-3 py-2 font-medium text-gray-100">
                        {entry.taskName}
                      </td>
                      <td className="px-3 py-2">{entry.username}</td>
                      <td className="px-3 py-2 font-semibold">
                        {formatTime(entry.totalMinutesSpent)}
                      </td>
                      <td className="px-3 py-2 text-green-400">
                        {formatTime(entry.regularMinutesSpent)}
                      </td>
                      <td className="px-3 py-2 text-yellow-400">
                        {formatTime(entry.overtimeMinutesSpent)}
                      </td>
                    </tr>

                    {expanded && (
                      <>
                        <tr className="bg-gray-800 text-xs uppercase text-gray-400">
                          <th className="px-3 py-2"></th>
                          <th className="px-3 py-2">Data</th>
                          <th className="px-3 py-2">Czas pracy</th>
                          <th className="px-3 py-2">Typ pracy</th>
                          <th className="px-3 py-2" colSpan={2}></th>
                        </tr>

                        {entry.entries.map((e) => (
                          <tr
                            key={e.id}
                            className="bg-gray-800 border-t border-gray-700 text-gray-400"
                          >
                            <td></td>
                            <td className="px-3 py-2 text-sm">
                              {new Date(e.entryDate).toLocaleDateString()}
                            </td>
                            <td className="px-3 py-2 text-sm">
                              {formatTime(e.minutesSpent)}
                            </td>
                            <td className="px-3 py-2">
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                                  e.isOvertime
                                    ? "bg-yellow-500 text-gray-900"
                                    : "bg-green-600 text-white"
                                }`}
                              >
                                {e.isOvertime ? "Nadgodziny" : "Normalny"}
                              </span>
                            </td>
                            <td colSpan={2}></td>
                          </tr>
                        ))}
                      </>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TimeSummaryPage;
