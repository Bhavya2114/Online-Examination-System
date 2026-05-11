import { useState, useContext, useEffect } from "react";
import api from "../../api/axiosInstance";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Block register if already logged in
  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (submitting) return;
    setSubmitting(true);

    try {
      await api.post("/auth/register", {
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        role: "student",
      });

      toast.success("Registration Successful! Please Login.");
      navigate("/login");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Registration Failed"
      );
    }

    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">

      {/* LEFT SIDE - FORM */}
      <div className="w-full md:w-1/2 bg-white dark:bg-slate-800 flex items-center justify-center p-8">

        <div className="w-full max-w-md">

          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
            Create Account
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            Sign up to get started with EduEx
          </p>

          <form onSubmit={handleRegister} className="space-y-6">

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="John Doe"
                className="w-full border-b border-slate-300 
                           dark:border-slate-600 bg-transparent 
                           focus:outline-none focus:border-indigo-500 
                           py-2 text-slate-700 dark:text-white"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="student@college.edu"
                className="w-full border-b border-slate-300 
                           dark:border-slate-600 bg-transparent 
                           focus:outline-none focus:border-indigo-500 
                           py-2 text-slate-700 dark:text-white"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full border-b border-slate-300 
                           dark:border-slate-600 bg-transparent 
                           focus:outline-none focus:border-indigo-500 
                           py-2 text-slate-700 dark:text-white"
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 
                         text-white py-3 rounded-lg font-medium 
                         transition-all duration-200
                         hover:scale-[1.02] active:scale-[0.98]
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Registering..." : "Register"}
            </button>
          </form>

          {/* Login Link */}
          <p className="mt-8 text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-indigo-600 hover:underline font-medium"
            >
              Login here
            </Link>
          </p>

        </div>

      </div>

      {/* RIGHT SIDE - GRADIENT PANEL */}
      <div className="hidden md:flex w-1/2
                      bg-gradient-to-br from-indigo-600 to-indigo-500 
                      text-white items-center justify-center 
                      p-12">

        <div className="text-center">
          <img
            src="/loginimage.png"
            alt="EduEx Platform"
            className="w-full max-w-[350px] mx-auto mb-8"
          />
          <h2 className="text-4xl font-bold mb-4">
            Join EduEx
          </h2>
          <p className="text-lg text-indigo-100">
            Smart & Secure Online Examination Platform
          </p>
        </div>

      </div>

    </div>
  );
};

export default Register;
