import { useContext } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="w-64 min-h-screen bg-gray-50 flex flex-col justify-between p-4">

      {/* Top Section */}
      <div>
        {/* Logo Section */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">EduEx</h1>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg p-3 mb-6 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm">{user?.name || "User"}</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-2">

          {/* Dashboard */}
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${isActive
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
              }`
            }
          >
            <div className="w-5 h-5 rounded-full bg-gray-300"></div>
            <span className="text-sm font-medium">Dashboard</span>
          </NavLink>

          {/* Exam */}
          <NavLink
            to="/exam"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${isActive
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
              }`
            }
          >
            <div className="w-5 h-5 rounded-full bg-gray-300"></div>
            <span className="text-sm font-medium">Exam</span>
          </NavLink>

          {/* Question Bank - Admin Only */}
          {user?.role === "admin" && (
            <NavLink
              to="/admin/question-bank"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
                }`
              }
            >
              <div className="w-5 h-5 rounded-full bg-gray-300"></div>
              <span className="text-sm font-medium">Question Bank</span>
            </NavLink>
          )}

          {/* Results */}
          <NavLink
            to="/results"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${isActive
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
              }`
            }
          >
            <div className="w-5 h-5 rounded-full bg-gray-300"></div>
            <span className="text-sm font-medium">Results</span>
          </NavLink>

        </nav>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-200 pt-4 space-y-2">

        {/* Support */}
        <NavLink
          to="/support"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${isActive
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:bg-gray-100"
            }`
          }
        >
          <div className="w-5 h-5 rounded-full bg-gray-300"></div>
          <span className="text-sm font-medium">Support</span>
        </NavLink>

        {/* Log Out */}
        <div onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors">
          <div className="w-5 h-5 rounded-full bg-red-200"></div>
          <span className="text-sm font-medium">Log Out</span>
        </div>

      </div>

    </aside>
  );
};

export default Sidebar;
