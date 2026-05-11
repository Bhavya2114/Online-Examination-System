import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes"; // We will build this next
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css"; // Tailwind CSS

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <ToastContainer position="top-right" autoClose={3000} />
    </AuthProvider>
  );
}

export default App;