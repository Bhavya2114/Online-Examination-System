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
    <div className="bg-white p-6 rounded-xl shadow-md mb-8 flex justify-between items-center">

      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          Welcome, {user?.name} 👋
        </h2>
        <p className="text-gray-500 mt-1 text-sm">
          {user?.email}
        </p>
      </div>

      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 
                   rounded-lg font-medium transition-all duration-200
                   hover:scale-105 active:scale-95"
      >
        Logout
      </button>

    </div>
  );
};

export default DashboardHeader;
