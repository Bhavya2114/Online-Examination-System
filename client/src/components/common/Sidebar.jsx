import { useContext, useMemo } from "react";
import { useNavigate, NavLink } from "react-router-dom";

import {
  BarChart2,
  BookOpen,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
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
    const second =
      (parts[1]?.[0] || parts[0]?.[1] || "").toString();

    return `${first}${second}`.toUpperCase();
  }, [user?.name]);

  const navBase =
    `
      group
      flex
      items-center
      gap-3
      px-4
      py-3
      rounded-xl
      text-[15px]
      font-medium
      text-slate-400
      hover:text-white
      hover:bg-white/5
      transition-all
      duration-200
    `;

  const navActive =
    `
      bg-gradient-to-r
      from-[#5c51e8]
      to-[#7c3aed]
      text-white
      shadow-lg
      shadow-indigo-500/20
      hover:text-white
    `;

  return (
    <aside
      className="
        w-[270px]
        bg-[#0f172a]
        text-white
        flex
        flex-col
        h-screen
        overflow-hidden
        border-r
        border-white/5
      "
    >

      {/* TOP */}
      <div className="px-5 py-6 border-b border-white/5">

        {/* BRAND */}
        <div className="flex items-center gap-3">

          <div
            className="
              w-11
              h-11
              rounded-2xl
              bg-gradient-to-br
              from-[#5c51e8]
              to-[#7c3aed]
              flex
              items-center
              justify-center
              shadow-lg
              shadow-indigo-500/20
            "
          >
            <GraduationCap className="w-5 h-5 text-white" />
          </div>

          <div>

            <h1 className="text-[19px] font-semibold tracking-tight text-white">
              EduEx
            </h1>

            <p className="text-xs text-slate-400 mt-0.5">
              Examination Portal
            </p>

          </div>

        </div>

      </div>

      {/* USER */}
      <div className="px-5 py-5 border-b border-white/5">

        <div className="flex items-center gap-3">

          {/* AVATAR */}
          <div
            className="
              w-11
              h-11
              rounded-xl
              bg-gradient-to-br
              from-indigo-500
              to-violet-600
              flex
              items-center
              justify-center
              text-sm
              font-semibold
              text-white
              shrink-0
            "
          >
            {initials}
          </div>

          {/* INFO */}
          <div className="min-w-0">

            <p className="text-sm font-semibold text-white truncate">
              {user?.name || "User"}
            </p>

            <p className="text-xs text-slate-400 capitalize">
              {user?.role || "Student"}
            </p>

          </div>

        </div>

      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-4 py-5 overflow-y-auto">

        <div className="flex flex-col gap-1.5">

          {/* DASHBOARD */}
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `${navBase} ${isActive ? navActive : ""}`
            }
          >
            <LayoutDashboard className="w-5 h-5 shrink-0" />

            <span className="tracking-tight">
              Dashboard
            </span>
          </NavLink>

          {/* EXAMS */}
          <NavLink
            to="/exam"
            className={({ isActive }) =>
              `${navBase} ${isActive ? navActive : ""}`
            }
          >
            <FileText className="w-5 h-5 shrink-0" />

            <span className="tracking-tight">
              Exams
            </span>
          </NavLink>

          {/* QUESTION BANK */}
          {(user?.role === "admin" ||
            user?.role === "owner") && (
            <NavLink
              to="/admin/question-bank"
              className={({ isActive }) =>
                `${navBase} ${isActive ? navActive : ""}`
              }
            >
              <BookOpen className="w-5 h-5 shrink-0" />

              <span className="tracking-tight">
                Question Bank
              </span>
            </NavLink>
          )}

          {/* RESULTS */}
          <NavLink
            to={
              user?.role === "admin" ||
              user?.role === "owner"
                ? "/admin/results"
                : "/results"
            }
            className={({ isActive }) =>
              `${navBase} ${isActive ? navActive : ""}`
            }
          >
            <BarChart2 className="w-5 h-5 shrink-0" />

            <span className="tracking-tight">
              Results
            </span>
          </NavLink>

        </div>

      </nav>

      {/* FOOTER */}
      <div className="px-4 py-5 border-t border-white/5">

        <button
          type="button"
          onClick={handleLogout}
          className="
            w-full
            flex
            items-center
            gap-3
            px-4
            py-3
            rounded-xl
            text-[15px]
            font-medium
            text-red-400
            hover:bg-red-500/10
            hover:text-red-300
            transition-all
            duration-200
          "
        >

          <LogOut className="w-5 h-5 shrink-0" />

          <span>
            Log out
          </span>

        </button>

      </div>

    </aside>
  );
};

export default Sidebar;