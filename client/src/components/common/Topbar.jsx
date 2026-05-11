const Topbar = ({ user }) => {
  // 🎯 Dynamic Dashboard Title based on User Role
  const dashboardTitle =
    user?.role === "admin"
      ? "Admin Dashboard"
      : user?.role === "owner"
        ? "Owner Dashboard"
        : "Student Dashboard";

  return (
    <div className="w-full bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">

      {/* Left Side */}
      <div className="flex items-center gap-4">
        {/* Title and Subtitle */}
        <div>
          <h1 className="text-lg font-semibold text-gray-800">{dashboardTitle}</h1>
          <p className="text-sm text-gray-500">Welcome back, {user?.name || "Student"}</p>
        </div>
      </div>

      {/* Right Side */}
      <div className="text-right">
        <p className="text-sm font-medium text-gray-700">ID: {user?.userIdNumber || "N/A"}</p>
      </div>

    </div>
  );
};

export default Topbar;
