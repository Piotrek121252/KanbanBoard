import "./App.css";
import { Routes, Route } from "react-router-dom";
import Home from "./routes/Home";
import About from "./routes/About";
import Login from "./routes/Login";
import Register from "./routes/Register";
import Navbar from "./components/Navbar";
import Kanban from "./routes/Kanban";
import BoardsPage from "./routes/BoardsPage";
import KanbanBoard from "./routes/KanbanBoard";

function App() {
  return (
    <>
      <div className="flex min-h-screen flex-col bg-gradient-to-b bg-gray-900 text-gray-100">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/boards" element={<BoardsPage />} />
          <Route path="/kanban" element={<KanbanBoard />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
