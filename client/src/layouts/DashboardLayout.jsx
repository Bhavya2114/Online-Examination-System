import { useContext } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Sidebar from "../components/common/Sidebar";
import Topbar from "../components/common/Topbar";
import { AuthContext } from "../context/AuthContext";

const DashboardLayout = () => {
  const { user } = useContext(AuthContext);

  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f7fb]">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Layout */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* ONLY DASHBOARD PAGE */}
        {location.pathname === "/dashboard" && (
          <Topbar user={user} />
        )}

        {/* Content */}
        <main
  className={`flex-1 overflow-y-auto overflow-x-hidden ${
    location.pathname === "/dashboard"
      ? "scrollbar-hide"
      : ""
  }`}
>

          <div
  className={`max-w-[1600px] mx-auto min-h-full px-8 py-6 ${
    location.pathname === "/dashboard" ? "" : "pt-8"
  }`}
>

            <Outlet />

          </div>

        </main>

      </div>

    </div>
  );
};

export default DashboardLayout;