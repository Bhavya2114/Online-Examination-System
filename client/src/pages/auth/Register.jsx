import { useState, useContext, useEffect } from "react";
import api from "../../api/axiosInstance";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";

import {
  GraduationCap,
  Mail,
  Lock,
  User,
  FileText,
  ShieldCheck,
  Chrome,
} from "lucide-react";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (submitting) return;

    setSubmitting(true);
    setError("");

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
      const message =
        error.response?.data?.message ||
        error.message ||
        "Registration failed";

      setError(message);
      toast.error(message);
    }

    setSubmitting(false);
  };

  const handleGoogleSignIn = () => {
    toast.info("Google sign-in isn't enabled yet.");
  };

  return (
    <div className="min-h-screen flex bg-white overflow-hidden">
      {/* LEFT SIDE */}
      <div className="hidden lg:flex lg:w-[42%] bg-white min-h-screen items-center justify-center px-12 xl:px-16">
        <div className="w-full max-w-md">
          {/* Brand */}
          <div className="flex items-center gap-3 mb-10">
            <div className="h-11 w-11 rounded-2xl bg-[#5b4cf0] flex items-center justify-center text-white shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-[26px] font-semibold text-black leading-none">
                EduEx
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Online examination portal
              </p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h1 className="text-[46px] leading-[1.02] tracking-tight font-semibold text-black">
              Create your account
            </h1>

            <p className="text-gray-500 text-base mt-3">
              Sign up to get started with EduEx
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-[12px] uppercase tracking-[0.08em] font-semibold text-gray-700 mb-2">
                Full Name
              </label>

              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />

                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="John Doe"
                  required
                  className="w-full h-12 rounded-xl border border-gray-300 bg-white pl-11 pr-4 text-[15px] text-black placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[#5b4cf0]/10 focus:border-[#5b4cf0] transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[12px] uppercase tracking-[0.08em] font-semibold text-gray-700 mb-2">
                Email Address
              </label>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="student@college.edu"
                  required
                  className="w-full h-12 rounded-xl border border-gray-300 bg-white pl-11 pr-4 text-[15px] text-black placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[#5b4cf0]/10 focus:border-[#5b4cf0] transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[12px] uppercase tracking-[0.08em] font-semibold text-gray-700 mb-2">
                Password
              </label>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="••••••••"
                  required
                  className="w-full h-12 rounded-xl border border-gray-300 bg-white pl-11 pr-16 text-[15px] text-black placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[#5b4cf0]/10 focus:border-[#5b4cf0] transition-all"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-[#5b4cf0] hover:text-[#4338ca]"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-12 rounded-xl bg-[linear-gradient(135deg,#4f46e5_0%,#6d5ef5_100%)] text-white font-semibold text-[15px] shadow-lg shadow-indigo-500/20 hover:scale-[1.01] transition-all"
            >
              {submitting ? "Creating account..." : "Create account"}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 py-1">
              <div className="h-px bg-gray-200 flex-1" />

              <span className="text-sm text-gray-400">
                or continue with
              </span>

              <div className="h-px bg-gray-200 flex-1" />
            </div>

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full h-12 rounded-xl border border-gray-300 bg-white hover:border-gray-400 transition-all"
            >
              <span className="flex items-center justify-center gap-3 font-medium text-gray-800">
                <Chrome className="h-5 w-5" />
                Continue with Google
              </span>
            </button>
          </form>

          {/* Footer */}
          <p className="mt-5 text-[15px] text-gray-500 text-center">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-[#5b4cf0] hover:text-[#4338ca]"
            >
              Sign in →
            </Link>
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="hidden lg:flex lg:w-[58%] relative overflow-hidden items-center justify-center bg-[linear-gradient(135deg,#4338ca_0%,#5b4cf0_45%,#7c3aed_100%)] text-white">
        {/* Glow Effects */}
        <div className="absolute w-[420px] h-[420px] rounded-full bg-white/10 blur-3xl top-[-140px] right-[-140px] opacity-40" />

        <div className="absolute w-[320px] h-[320px] rounded-full bg-white/10 blur-3xl bottom-[-120px] left-[-120px] opacity-25" />

        <div className="relative z-10 w-full max-w-xl px-10 flex flex-col gap-4">
          {/* Feature Card */}
          <div className="bg-white/12 backdrop-blur-xl border border-white/20 rounded-[28px] px-7 py-5 flex items-center gap-5 shadow-2xl shadow-black/10">
            <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center">
              <FileText className="h-6 w-6" />
            </div>

            <div>
              <h3 className="text-[30px] font-semibold">
                Smart Exams
              </h3>

              <p className="text-white/70 mt-1 text-sm">
                Adaptive, proctored & fair
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            {[
              ["12k+", "Students"],
              ["98%", "Pass rate"],
              ["500+", "Exams"],
              ["4.9★", "Rating"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="bg-white/12 backdrop-blur-xl border border-white/20 rounded-[24px] py-6 text-center shadow-xl shadow-black/5"
              >
                <div className="text-4xl font-semibold tracking-tight">
                  {value}
                </div>

                <div className="text-white/70 text-sm mt-2">
                  {label}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Content */}
          <div className="flex flex-col items-center text-center gap-2 pt-2">
            <h2 className="text-[36px] leading-tight font-semibold tracking-tight max-w-lg">
              Your exams, simplified
            </h2>

            <p className="text-white/70 text-base leading-relaxed max-w-md">
              Secure, smart and stress-free online examination experience
            </p>

            <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-xl px-4 py-1.5 text-sm text-white/90">
              <ShieldCheck className="h-4 w-4" />
              End-to-end encrypted & proctored
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;