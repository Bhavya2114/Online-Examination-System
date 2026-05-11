import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { GraduationCap, Mail, Lock, FileText, ShieldCheck, Chrome } from "lucide-react";

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

  const handleForgotPassword = () => {
    toast.info("Password reset isn't available yet. Please contact support.");
  };

  const handleGoogleSignIn = () => {
    toast.info("Google sign-in isn't enabled yet.");
  };

  return (
    <div className={authUi.page}>
      {/* LEFT SIDE - FORM */}
      <div className="flex flex-col justify-center min-h-screen px-16">
        <div className={authUi.leftInner}>
          <div className={authUi.brandRow}>
            <div className={authUi.brandMark} aria-hidden="true">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className={authUi.brandName}>EduEx</p>
              <p className={authUi.brandTagline}>Online examination portal</p>
            </div>
          </div>

          <h1 className={authUi.title}>Welcome back</h1>
          <p className={authUi.subtitle}>Sign in to your exam portal</p>

          <form onSubmit={handleSubmit} className={authUi.form} aria-busy={submitting}>
            {/* Error Box */}
            {error && (
              <div className={authUi.errorBox} role="alert" aria-live="polite" id="login-error">
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label className={authUi.label} htmlFor="login-email">
                Email address
              </label>
              <div className="relative">
                <Mail className={authUi.inputIcon} size={18} aria-hidden="true" />
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={handleInputChange(setEmail)}
                  required
                  placeholder="student@college.edu"
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "login-error" : undefined}
                  className={`${authUi.inputBase} ${authUi.inputWithIconPadding} ${error ? authUi.inputError : authUi.inputNormal}`}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className={authUi.label} htmlFor="login-password">
                Password
              </label>

              <div className="relative">
                <Lock className={authUi.inputIcon} size={18} aria-hidden="true" />
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={handleInputChange(setPassword)}
                  required
                  placeholder="••••••••"
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "login-error" : undefined}
                  className={`${authUi.inputBase} ${authUi.inputWithIconPadding} pr-14 ${error ? authUi.inputError : authUi.inputNormal}`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-600 hover:text-indigo-700 dark:text-slate-300 dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900 rounded"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className={authUi.helperRow}>
              <button type="button" onClick={handleForgotPassword} className={authUi.helperLink}>
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <button type="submit" disabled={submitting} className={authUi.primaryButton}>
              {submitting ? "Signing in..." : "Sign in"}
            </button>

            {/* Divider */}
            <div className={authUi.dividerRow} aria-hidden="true">
              <div className={authUi.dividerLine} />
              <span className={authUi.dividerText}>or continue with</span>
              <div className={authUi.dividerLine} />
            </div>

            {/* Google SSO */}
            <button type="button" onClick={handleGoogleSignIn} className={authUi.ssoButton}>
              <span className={authUi.ssoButtonInner}>
                <Chrome className="h-5 w-5" aria-hidden="true" />
                Continue with Google
              </span>
            </button>
          </form>

          {/* Register Link */}
          <p className={authUi.footerText}>
            Don't have an account?{" "}
            <Link to="/register" className={authUi.footerLink}>
              Create one
            </Link>
          </p>
        </div>
      </div>

      {/* RIGHT SIDE - BRANDING PANEL */}
      <div className="hidden md:flex flex-col justify-center items-center min-h-screen px-10 gap-5 relative overflow-hidden bg-linear-to-br from-[#4338ca] via-[#5c51e8] to-[#7c3af5] text-white">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute z-0 w-64 h-64 rounded-full bg-white/10 blur-3xl -top-16 -right-16" />
        <div className="pointer-events-none absolute z-0 w-48 h-48 rounded-full bg-white/10 blur-3xl -bottom-12 -left-12" />

        <div className="relative z-10 w-full max-w-lg flex flex-col gap-5">
          {/* Smart Exams Feature Card */}
          <div className="w-full bg-white/20 border border-white/30 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-4">
            <div className="w-11 h-11 bg-white/25 rounded-xl flex items-center justify-center" aria-hidden="true">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-white font-medium text-base">Smart Exams</p>
              <p className="text-white/70 text-sm">Adaptive, proctored and fair</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 w-full">
            <div className="bg-white/25 border border-white/35 backdrop-blur-sm rounded-2xl py-6 text-center">
              <div className="text-white text-3xl font-semibold">12k+</div>
              <div className="text-white/70 text-sm mt-1">Students</div>
            </div>
            <div className="bg-white/25 border border-white/35 backdrop-blur-sm rounded-2xl py-6 text-center">
              <div className="text-white text-3xl font-semibold">98%</div>
              <div className="text-white/70 text-sm mt-1">Pass rate</div>
            </div>
            <div className="bg-white/25 border border-white/35 backdrop-blur-sm rounded-2xl py-6 text-center">
              <div className="text-white text-3xl font-semibold">500+</div>
              <div className="text-white/70 text-sm mt-1">Exams</div>
            </div>
            <div className="bg-white/25 border border-white/35 backdrop-blur-sm rounded-2xl py-6 text-center">
              <div className="text-white text-3xl font-semibold">4.9</div>
              <div className="text-white/70 text-sm mt-1">Rating</div>
            </div>
          </div>

          {/* Bottom Text Section */}
          <div className="flex flex-col items-center gap-3">
            <h2 className="text-white text-2xl font-semibold text-center">
              Your exams, simplified
            </h2>
            <p className="text-white/70 text-sm text-center leading-relaxed">
              Secure, smart and stress-free online examination experience
            </p>

            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-5 py-2 text-white/85 text-xs">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              End-to-end encrypted and proctored
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
