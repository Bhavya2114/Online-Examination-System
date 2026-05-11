
import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  GraduationCap,
  Mail,
  Lock,
  FileText,
  ShieldCheck,
  Chrome,
} from "lucide-react";

import { authUi } from "./authUi";

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
      navigate("/dashboard");
    } else {
      setError(result.message);
      toast.error(result.message);
    }

    setSubmitting(false);
  };

  const handleForgotPassword = () => {
    toast.info("Password reset isn't available yet.");
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
          <div className="flex items-center gap-3 mb-16">
            <div className="h-12 w-12 rounded-2xl bg-[#5b4cf0] flex items-center justify-center text-white shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-[28px] font-semibold text-black leading-none">
                EduEx
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Online examination portal
              </p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-10">
            <h1 className="text-[52px] leading-[1.05] tracking-tight font-semibold text-black">
              Welcome back
            </h1>

            <p className="text-gray-500 text-lg mt-3">
              Sign in to your exam portal
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-[13px] uppercase tracking-[0.08em] font-semibold text-gray-700 mb-2">
                Email Address
              </label>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@college.edu"
                  required
                  className="w-full h-14 rounded-xl border border-gray-300 bg-white pl-12 pr-4 text-[15px] text-black placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[#5b4cf0]/10 focus:border-[#5b4cf0] transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[13px] uppercase tracking-[0.08em] font-semibold text-gray-700 mb-2">
                Password
              </label>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-14 rounded-xl border border-gray-300 bg-white pl-12 pr-16 text-[15px] text-black placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[#5b4cf0]/10 focus:border-[#5b4cf0] transition-all"
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

            {/* Forgot Password */}
            <div className="flex justify-end -mt-1">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm font-medium text-[#5b4cf0] hover:text-[#4338ca]"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-14 rounded-xl bg-[linear-gradient(135deg,#4f46e5_0%,#6d5ef5_100%)] text-white font-semibold text-[15px] shadow-lg shadow-indigo-500/20 hover:scale-[1.01] transition-all"
            >
              {submitting ? "Signing in..." : "Sign in to Portal"}
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
              className="w-full h-14 rounded-xl border border-gray-300 bg-white hover:border-gray-400 transition-all"
            >
              <span className="flex items-center justify-center gap-3 font-medium text-gray-800">
                <Chrome className="h-5 w-5" />
                Continue with Google
              </span>
            </button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-[15px] text-gray-500 text-center">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-[#5b4cf0] hover:text-[#4338ca]"
            >
              Create one →
            </Link>
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="hidden lg:flex lg:w-[58%] relative overflow-hidden items-center justify-center bg-[linear-gradient(135deg,#4338ca_0%,#5b4cf0_45%,#7c3aed_100%)] text-white">
        {/* Glow Effects */}
        <div className="absolute w-[420px] h-[420px] rounded-full bg-white/10 blur-3xl top-[-140px] right-[-140px] opacity-40" />

        <div className="absolute w-[320px] h-[320px] rounded-full bg-white/10 blur-3xl bottom-[-120px] left-[-120px] opacity-25" />

        <div className="relative z-10 w-full max-w-xl px-10 flex flex-col gap-5">
          {/* Feature Card */}
          <div className="bg-white/12 backdrop-blur-xl border border-white/20 rounded-[28px] px-7 py-6 flex items-center gap-5 shadow-2xl shadow-black/10">
            <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center">
              <FileText className="h-7 w-7" />
            </div>

            <div>
              <h3 className="text-2xl font-semibold">
                Smart Exams
              </h3>

              <p className="text-white/70 mt-1 text-base">
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
                className="bg-white/12 backdrop-blur-xl border border-white/20 rounded-[24px] py-8 text-center shadow-xl shadow-black/5"
              >
                <div className="text-5xl font-semibold tracking-tight">
                  {value}
                </div>

                <div className="text-white/70 text-base mt-2">
                  {label}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Content */}
          <div className="flex flex-col items-center text-center gap-3 pt-4">
            <h2 className="text-[42px] leading-tight font-semibold tracking-tight max-w-lg">
              Your exams, simplified
            </h2>

            <p className="text-white/70 text-lg leading-relaxed max-w-md">
              Secure, smart and stress-free online examination experience
            </p>

            <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-xl px-5 py-2 text-sm text-white/90">
              <ShieldCheck className="h-4 w-4" />
              End-to-end encrypted & proctored
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE VIEW */}
      <div className="lg:hidden flex min-h-screen items-center justify-center px-6 py-10 w-full bg-white">
        <div className="w-full max-w-md text-center text-gray-500 text-sm">
          Mobile auth layout can be added separately.
        </div>
      </div>
    </div>
  );
};

export default Login;
