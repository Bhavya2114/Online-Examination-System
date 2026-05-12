import { Bell } from "lucide-react";

const Topbar = ({
  user,
  title,
  subtitle,
}) => {

  const dateText = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const defaultTitle =
    user?.role === "admin"
      ? "Admin Dashboard"
      : user?.role === "owner"
        ? "Owner Dashboard"
        : "Dashboard";

  return (
    <header className="bg-white border-b border-slate-200/80 px-8 py-5 shrink-0">

      <div className="flex items-start justify-between gap-6">

        {/* LEFT */}
        <div>

          <h1 className="text-[42px] leading-[1.1] font-bold tracking-[-1px] text-slate-900">
            {title || defaultTitle}
          </h1>

          <p className="mt-2 text-[15px] text-slate-500">

            {subtitle || (
              <>
                {dateText}

                <span className="mx-2 text-slate-300">
                  —
                </span>

                Welcome back,
                <span className="font-medium text-slate-700 ml-1">
                  {user?.name || "User"}
                </span>
              </>
            )}

          </p>

        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3 shrink-0">

          {/* Notification */}
          <button
            type="button"
            aria-label="Notifications"
            className="relative w-11 h-11 rounded-2xl border border-slate-200/80 bg-white flex items-center justify-center text-slate-600 shadow-sm hover:bg-slate-50 transition-all duration-200"
          >

            <Bell className="w-[18px] h-[18px]" />

            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />

          </button>

          {/* Avatar */}
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#5c51e8] to-[#7c3aed] flex items-center justify-center text-white text-sm font-semibold shadow-lg shadow-indigo-500/20">

            {user?.name?.[0]?.toUpperCase() || "A"}

          </div>

        </div>

      </div>

    </header>
  );
};

export default Topbar;