import React from "react";
import { BiSolidDashboard } from "react-icons/bi";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav
      className="bg-slate-800 shadow-lg flex items-center
     justify-around py-3 px-32 fixed top-0 left-0 w-full"
    >
      <Link to="/">
        <span className="font-semibold text-lg flex items-center gap-3 text-blue-400">
          <BiSolidDashboard className="text-4xl" />
          <span className="font-semibold text-2xl">TaskFlow</span>
        </span>
      </Link>
      <div className="flex items-center gap-5 text-black">
        <Link
          to="/"
          className="py-1 px-3 text-lg font-light text-white
           hover:text-sky-300 rounded-2xl hover:bg-slate-700
            transition duration-300"
        >
          Home
        </Link>
        <Link
          to="/kanban"
          className="py-1 px-3 text-lg font-light text-white
           hover:text-sky-300 rounded-2xl hover:bg-slate-700
            transition duration-300"
        >
          Kanban-Demo
        </Link>
        <Link
          to="/about"
          className="py-1 px-3 text-lg font-light text-white
           hover:text-sky-300 rounded-2xl hover:bg-slate-700
            transition duration-300"
        >
          About
        </Link>
        <Link
          to="/login"
          className="py-1 px-3 text-lg font-light text-white
           hover:text-sky-300 rounded-2xl hover:bg-slate-700
            transition duration-300"
        >
          Login
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
