import { getUserRoleFromLocalStorage } from "../../helpers/getUserRoleFromLocalStorage";

import { Link } from "react-router-dom";
import { logout } from "../../api/authService";
import logo from "../../assets/logo.png";
const Navbar = () => {
  const userRole = getUserRoleFromLocalStorage()?.role;
  return (
    <nav className="bg-slate-100 px-6 py-2 flex items-center justify-between flex">
      <img src={logo} alt="Logo" className="w-20 h-20 rounded-full" />
      <div>
        {userRole === "admin" ? (
          <Link
            to="/admin/dashboard"
            className="ml-auto mr-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Back to Dashboard
          </Link>
        ) : (
          <Link
            to="/reception/dashboard"
            className="ml-auto mr-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Back to Dashboard
          </Link>
        )}

        <button
          onClick={logout}
          className="ml-auto bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
