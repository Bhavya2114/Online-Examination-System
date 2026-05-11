import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const Navbar = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">

      <h1 className="text-lg font-semibold text-gray-700">
        Online Examination System
      </h1>

      <div className="text-sm text-gray-600">
        Logged in as <span className="font-medium">{user?.name}</span>
      </div>

    </div>
  );
};

export default Navbar;
