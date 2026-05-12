import { useContext } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Sidebar from "../components/common/Sidebar";
import Topbar from "../components/common/Topbar";
import { AuthContext } from "../context/AuthContext";

const DashboardLayout = () => {
  const { user } = useContext(AuthContext);

  const location = useLocation();

  const isDashboard = location.pathname === "/dashboard";

  return (
    <div className="flex h-screen bg-[#f7f8fc] overflow-hidden">

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 h-screen">

        {/* TOPBAR ONLY FOR DASHBOARD */}
        {isDashboard && <Topbar user={user} />}

        {/* MAIN CONTENT */}
        <main
          className={`
            flex-1
            overflow-y-auto
            overflow-x-hidden
            ${isDashboard ? "scrollbar-hide" : ""}
          `}
        >

          {/* PAGE CONTAINER */}
          <div
            className={`
              w-full
              max-w-[1700px]
              mx-auto
              min-h-full
              px-5
              lg:px-8
              py-5
              ${isDashboard ? "" : "pt-7"}
            `}
          >

            <Outlet />

          </div>

        </main>

      </div>

    </div>
  );
};

export default DashboardLayout;