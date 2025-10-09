import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <div className="flex flex-col items-start max-w-3xl gap-5">
        <h1 className="text-4xl font-bold mb-6">TaskFlow Homepage</h1>
        <p>
          TaskFlow — Organize, Track, Deliver. Zarządzaj z łatwością zadaniami w
          projekcie korzystając z nowoczesnej współdzielonej tablicy Kanban.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition whitespace-nowrap"
            onClick={() => navigate("/login")}
          >
            Zaloguj się!
          </button>
          <button
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition whitespace-nowrap"
            onClick={() => navigate("/register")}
          >
            Zarejestruj się!
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
