import { Bell, Search } from "lucide-react";

const Topbar = ({ user }) => {
  const dashboardTitle =
    user?.role === "admin"
      ? "Admin Dashboard"
      : user?.role === "owner"
        ? "Owner Dashboard"
        : "Dashboard";

  const dateText = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  });

  const roleBadgeText = "Admin";

  return (
    <div className="bg-white border-b border-gray-100 px-6 py-3.5 flex items-center justify-between">
      {/* Left */}
      <div>
        <div className="text-[17px] font-medium text-gray-800">
          {dashboardTitle}
        </div>
        <div className="text-[12px] text-gray-400">
          {dateText} — Welcome back, {user?.name || "User"}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2.5">
        <div className="bg-[#eeedfe] text-[#5c51e8] text-xs font-medium px-3 py-1 rounded-full">
          {roleBadgeText}
        </div>

        <button
          type="button"
          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4 text-gray-600" />
        </button>

        <button
          type="button"
          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center"
          aria-label="Search"
        >
          <Search className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default Topbar;
