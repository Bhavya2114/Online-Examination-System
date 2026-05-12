import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const DashboardHeader = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8 flex justify-between items-center">

      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome, {user?.name} 👋
        </h2>
        <p className="text-gray-600 mt-1 text-sm">
          {user?.email}
        </p>
      </div>

      <button
        onClick={handleLogout}
        className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 
                   rounded-lg font-medium transition-all duration-200
                   hover:shadow-md active:shadow-sm"
      >
        Logout
      </button>

    </div>
  );
};

export default DashboardHeader;
