import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError("");

    const result = await login(email.trim(), password.trim());

    if (result.success) {
      toast.success("Login Successful!");
      setEmail("");
      setPassword("");
      setError("");
      navigate("/dashboard");
    } else {
      setError(result.message);
      toast.error(result.message);
    }

    setSubmitting(false);
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    if (error) setError("");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">

      {/* LEFT SIDE - FORM */}
      <div className="w-full md:w-1/2 bg-white dark:bg-slate-800 flex items-center justify-center p-8">

        <div className="w-full max-w-md">

          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
            Login
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            Enter your account details
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Error Box */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-400 dark:border-red-600 rounded-lg p-4 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  ✕
                </div>
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                Email Address
              </label>

              <input
                type="email"
                value={email}
                onChange={handleInputChange(setEmail)}
                required
                placeholder="student@college.edu"
                className={`w-full border-b bg-transparent 
                           focus:outline-none 
                           py-2 text-slate-700 dark:text-white transition-colors
                           ${error
                    ? "border-red-500 dark:border-red-500 focus:border-red-500"
                    : "border-slate-300 dark:border-slate-600 focus:border-indigo-500"
                  }`}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handleInputChange(setPassword)}
                  required
                  placeholder="••••••••"
                  className={`w-full border-b bg-transparent 
                             focus:outline-none 
                             py-2 text-slate-700 dark:text-white transition-colors
                             ${error
                      ? "border-red-500 dark:border-red-500 focus:border-red-500"
                      : "border-slate-300 dark:border-slate-600 focus:border-indigo-500"
                    }`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-2 text-sm 
                             text-gray-500 hover:text-indigo-600 transition-colors"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            {!error && (
              <div className="text-sm text-slate-500 hover:text-indigo-600 cursor-pointer transition-colors">
                Forgot Password?
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 
                         text-white py-3 rounded-lg font-medium 
                         transition-all duration-200
                         hover:scale-[1.02] active:scale-[0.98]
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Register Link */}
          <p className="mt-8 text-sm text-slate-500 dark:text-slate-400">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="text-indigo-600 hover:underline font-medium"
            >
              SignUp
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
            Welcome to EduEx
          </h2>
          <p className="text-lg text-indigo-100">
            Smart & Secure Online Examination Platform
          </p>
        </div>

      </div>

    </div>
  );
};

export default Login;
