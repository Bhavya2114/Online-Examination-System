import { useContext, useMemo } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import {
  BarChart2,
  BookOpen,
  FileText,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Settings,
  Users
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = useMemo(() => {
    const name = (user?.name || "").trim();
    if (!name) return "NA";

    const parts = name.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] || "";
    const second = (parts[1]?.[0] || parts[0]?.[1] || "").toString();
    return `${first}${second}`.toUpperCase();
  }, [user?.name]);

  const navBase =
    "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] text-gray-500 cursor-pointer hover:bg-gray-50 hover:text-gray-800 transition-colors";
  const navActive =
    "bg-[#eeedfe] text-[#5c51e8] font-medium border-l-[3px] border-[#5c51e8] pl-[calc(0.75rem-3px)]";

  return (
    <aside className="w-[220px] bg-white border-r border-gray-100 flex flex-col h-full">
      {/* Brand */}
      <div className="border-b border-gray-100 px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#5c51e8] rounded-lg flex items-center justify-center">
            <GraduationCap className="text-white text-base w-4 h-4" />
          </div>
          <div className="text-[15px] font-medium text-gray-800">EduEx</div>
        </div>
      </div>

      {/* User */}
      <div className="border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#eeedfe] flex items-center justify-center">
            <span className="text-[13px] font-medium text-[#5c51e8]">
              {initials}
            </span>
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-medium text-gray-800 truncate">
              {user?.name || "User"}
            </div>
            <div className="text-[11px] text-gray-400">
              {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "User"}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-2 py-3 flex-1 flex flex-col gap-0.5">
        <div className="text-[10px] font-medium tracking-widest uppercase text-gray-300 px-3 pt-4 pb-1">
          Main
        </div>

        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `${navBase} ${isActive ? navActive : ""}`
          }
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/exam"
          className={({ isActive }) =>
            `${navBase} ${isActive ? navActive : ""}`
          }
        >
          <FileText className="w-4 h-4" />
          <span>Exams</span>
        </NavLink>

        {(user?.role === "admin" || user?.role === "owner") && (
          <NavLink
            to="/admin/question-bank"
            className={({ isActive }) =>
              `${navBase} ${isActive ? navActive : ""}`
            }
          >
            <BookOpen className="w-4 h-4" />
            <span>Question Bank</span>
          </NavLink>
        )}

        {(user?.role === "admin" || user?.role === "owner") && (
          <button
            type="button"
            aria-disabled="true"
            className={`${navBase} opacity-60 cursor-not-allowed`}
            title="Students page not available yet"
          >
            <Users className="w-4 h-4" />
            <span>Students</span>
          </button>
        )}

        <NavLink
          to={user?.role === "admin" || user?.role === "owner" ? "/admin/results" : "/results"}
          className={({ isActive }) =>
            `${navBase} ${isActive ? navActive : ""}`
          }
        >
          <BarChart2 className="w-4 h-4" />
          <span>Results</span>
        </NavLink>

        <div className="text-[10px] font-medium tracking-widest uppercase text-gray-300 px-3 pt-4 pb-1">
          System
        </div>

        <button
          type="button"
          aria-disabled="true"
          className={`${navBase} opacity-60 cursor-not-allowed`}
          title="Coming soon"
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>

        <NavLink
          to="/support"
          className={({ isActive }) =>
            `${navBase} ${isActive ? navActive : ""}`
          }
        >
          <HelpCircle className="w-4 h-4" />
          <span>Support</span>
        </NavLink>
      </nav>

      {/* Logout */}
      <div className="border-t border-gray-100 px-2 py-3">
        <button
          type="button"
          onClick={handleLogout}
          className={`${navBase} text-red-500 hover:bg-red-50 hover:text-red-600 w-full`}
        >
          <LogOut className="w-4 h-4" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
