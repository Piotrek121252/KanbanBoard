import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 w-full flex items-center justify-center">
      <div className="flex flex-col items-start max-w-3xl gap-5">
        <h1 className="text-4xl font-bold mb-6">TaskFlow Homepage</h1>
        <p>
          TaskFlow — Organize, Track, Deliver. Zarządzaj z łatwością zadaniami w
          projekcie korzystając z nowoczesnej współdzielonej tablicy Kanban.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button className="lgnBtn" onClick={() => navigate("/login")}>
            Zaloguj się!
          </Button>
          <Button className="rgnBtn" onClick={() => navigate("/register")}>
            Rejestracja
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
