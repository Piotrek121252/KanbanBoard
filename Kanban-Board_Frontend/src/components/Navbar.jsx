import { BiSolidDashboard } from "react-icons/bi";
import { Link, NavLink } from "react-router-dom";

const Navbar = () => {
  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/boards", label: "Boards" },
    { to: "/kanban", label: "Kanban-Demo" },
    { to: "/about", label: "About" },
    { to: "/login", label: "Login" },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full bg-slate-800 shadow-lg py-3 px-6 md:px-16 flex items-center justify-between z-50">
      <Link to="/" className="flex items-center gap-2 text-blue-400">
        <BiSolidDashboard className="text-3xl" />
        <span className="text-2xl font-semibold">TaskFlow</span>
      </Link>

      <div className="flex gap-4">
        {navLinks.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `px-3 py-1 text-lg text-white rounded-2xl transition duration-300 ${
                isActive
                  ? "bg-slate-700 text-sky-300"
                  : "hover:bg-slate-700 hover:text-sky-300"
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
