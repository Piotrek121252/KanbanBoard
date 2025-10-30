import { BiSolidDashboard } from "react-icons/bi";
import { Link, NavLink } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const Navbar = () => {
  const { username, logout } = useAuth();

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/boards", label: "Boards" },
    { to: "/about", label: "About" },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full bg-slate-800 shadow-lg py-3 px-6 md:px-16 flex items-center justify-between z-50">
      <Link to="/" className="flex items-center gap-2 text-blue-400">
        <BiSolidDashboard className="text-3xl" />
        <span className="text-2xl font-semibold">TaskFlow</span>
      </Link>

      <div className="flex gap-4 items-center">
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

        {username ? (
          <div className="flex items-center gap-3 ml-4">
            <span className="bg-slate-700 text-sky-300 px-3 py-1 rounded-full font-medium text-sm">
              {username}
            </span>

            <button
              onClick={logout}
              className="flex items-center px-3 py-1 text-sm text-white bg-red-600 rounded-full hover:bg-red-700 transition duration-300"
              title="Logout"
            >
              Logout
            </button>
          </div>
        ) : (
          <NavLink
            to="/login"
            className={({ isActive }) =>
              `px-3 py-1 text-lg text-white rounded-2xl transition duration-300 ${
                isActive
                  ? "bg-slate-700 text-sky-300"
                  : "hover:bg-slate-700 hover:text-sky-300"
              }`
            }
          >
            Login
          </NavLink>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
