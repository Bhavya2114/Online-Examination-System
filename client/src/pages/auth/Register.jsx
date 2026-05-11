import { useState, useContext, useEffect } from "react";
import api from "../../api/axiosInstance";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";
import { GraduationCap, Mail, Lock, User, FileText, ShieldCheck, Chrome } from "lucide-react";

import { authUi } from "./authUi";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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
        error.response?.data?.message || error.message || "Registration failed";

      setError(message);
      toast.error(message);
    }

    setSubmitting(false);
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    if (error) setError("");
  };

  const handleGoogleSignIn = () => {
    toast.info("Google sign-in isn't enabled yet.");
  };

  return (
    <div className={authUi.page}>
      {/* LEFT SIDE - FORM */}
      <div className={authUi.leftPanel}>
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

          <h1 className={authUi.title}>Create your account</h1>
          <p className={authUi.subtitle}>Sign up to get started with EduEx</p>

          <form onSubmit={handleRegister} className={authUi.form} aria-busy={submitting}>
            {/* Error Box */}
            {error && (
              <div className={authUi.errorBox} role="alert" aria-live="polite" id="register-error">
                {error}
              </div>
            )}

            {/* Name */}
            <div>
              <label className={authUi.label} htmlFor="register-name">
                Full name
              </label>
              <div className="relative">
                <User className={authUi.inputIcon} size={18} aria-hidden="true" />
                <input
                  id="register-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={handleInputChange(setName)}
                  required
                  placeholder="John Doe"
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "register-error" : undefined}
                  className={`${authUi.inputBase} ${authUi.inputWithIconPadding} ${error ? authUi.inputError : authUi.inputNormal}`}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className={authUi.label} htmlFor="register-email">
                Email address
              </label>
              <div className="relative">
                <Mail className={authUi.inputIcon} size={18} aria-hidden="true" />
                <input
                  id="register-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={handleInputChange(setEmail)}
                  required
                  placeholder="student@college.edu"
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "register-error" : undefined}
                  className={`${authUi.inputBase} ${authUi.inputWithIconPadding} ${error ? authUi.inputError : authUi.inputNormal}`}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className={authUi.label} htmlFor="register-password">
                Password
              </label>
              <div className="relative">
                <Lock className={authUi.inputIcon} size={18} aria-hidden="true" />
                <input
                  id="register-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={handleInputChange(setPassword)}
                  required
                  placeholder="••••••••"
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "register-error" : undefined}
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

            {/* Button */}
            <button type="submit" disabled={submitting} className={authUi.primaryButton}>
              {submitting ? "Creating account..." : "Create account"}
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

          {/* Login Link */}
          <p className={authUi.footerText}>
            Already have an account?{" "}
            <Link to="/login" className={authUi.footerLink}>
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* RIGHT SIDE - BRANDING PANEL */}
      <div className={authUi.rightPanel}>
        <div className={authUi.decorationA} />
        <div className={authUi.decorationB} />

        <div className={authUi.rightInner}>
          <div className={`${authUi.glassCard} ${authUi.glassCardInner} flex items-center gap-4`}>
            <div className="h-12 w-12 rounded-xl bg-white/15 grid place-items-center" aria-hidden="true">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold">Smart Exams</p>
              <p className="text-xs text-white/80">Adaptive, proctored and fair</p>
            </div>
          </div>

          <div className={authUi.statGrid}>
            <div className={authUi.statCard}>
              <div className={authUi.statValue}>12k+</div>
              <div className={authUi.statLabel}>Students</div>
            </div>
            <div className={authUi.statCard}>
              <div className={authUi.statValue}>98%</div>
              <div className={authUi.statLabel}>Pass rate</div>
            </div>
            <div className={authUi.statCard}>
              <div className={authUi.statValue}>500+</div>
              <div className={authUi.statLabel}>Exams</div>
            </div>
            <div className={authUi.statCard}>
              <div className={authUi.statValue}>4.9</div>
              <div className={authUi.statLabel}>Rating</div>
            </div>
          </div>

          <div>
            <div className={authUi.rightTitle}>Your exams, simplified</div>
            <div className={authUi.rightSubtitle}>
              Secure, smart and stress-free online examination experience
            </div>
          </div>

          <div className={authUi.pill}>
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            End-to-end encrypted and proctored
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
