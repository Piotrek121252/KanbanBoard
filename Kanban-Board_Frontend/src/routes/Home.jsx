import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import axios from "axios";
import HomeBoardCard from "../components/HomeBoardCard";
import heroBoard from "../assets/hero_board.png";

const Home = () => {
  const navigate = useNavigate();
  const { token, username } = useAuth();

  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBoards = async () => {
      if (!token) return;

      setLoading(true);
      try {
        const response = await axios.get("http://localhost:8080/api/boards", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBoards(response.data);
      } catch (err) {
        console.error("Nie udało się pobrać tablic:", err);
        setBoards([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBoards();
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col lg:flex-row items-center lg:justify-between gap-12">
        <div className="lg:w-1/2 flex flex-col gap-6">
          <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-400 to-indigo-400 tracking-tight">
            TaskFlow
          </h1>

          <p className="text-lg lg:text-xl text-gray-300 leading-relaxed">
            Zarządzaj projektami IT efektywnie. Twórz zadania, śledź postępy i
            współpracuj z zespołem na nowoczesnej tablicy Kanban.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            {token ? (
              <>
                <button
                  className="w-full sm:w-auto bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition"
                  onClick={() => navigate("/boards")}
                >
                  Przejdź do tablic
                </button>
                <button
                  className="w-full sm:w-auto bg-slate-600 text-white py-3 px-6 rounded-lg hover:bg-slate-700 transition"
                  onClick={() => navigate("/profile")}
                >
                  Twój profil
                </button>
              </>
            ) : (
              <>
                <button
                  className="w-full sm:w-auto bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition"
                  onClick={() => navigate("/login")}
                >
                  Zaloguj się
                </button>
                <button
                  className="w-full sm:w-auto bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition"
                  onClick={() => navigate("/register")}
                >
                  Zarejestruj się
                </button>
              </>
            )}
          </div>

          {token && username && (
            <p className="mt-4 text-gray-300 text-lg">
              Witaj,{" "}
              <span className="text-sky-300 font-semibold">{username}</span>!
              Kontynuuj pracę w swoich tablicach.
            </p>
          )}
        </div>

        <div className="lg:w-3/4 flex justify-center">
          <img
            src={heroBoard}
            alt="TaskFlow Kanban"
            className="w-full max-w-md lg:max-w-2xl rounded-xl shadow-xl"
          />
        </div>
      </div>

      {token && boards.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h2 className="text-3xl font-semibold mb-6">
            Twoje ostatnie tablice
          </h2>
          {loading ? (
            <p className="text-gray-400">Ładowanie tablic...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {boards.slice(0, 3).map((board) => (
                <HomeBoardCard key={board.id} board={board} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
