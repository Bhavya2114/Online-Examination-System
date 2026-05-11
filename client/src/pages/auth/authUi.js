export const authUi = {
  page: "h-screen overflow-hidden grid md:grid-cols-2 font-sans",

  leftPanel:
    "min-h-screen bg-white dark:bg-slate-900 flex flex-col justify-center items-center px-6 sm:px-10 lg:px-16",
  leftInner: "w-full max-w-md",

  brandRow: "mb-6 flex items-center gap-3",
  brandMark:
    "h-10 w-10 rounded-xl bg-indigo-600 text-white grid place-items-center shadow-sm",
  brandName: "text-sm font-semibold text-slate-900 dark:text-white",
  brandTagline: "text-xs text-slate-500 dark:text-slate-400",

  title:
    "text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white",
  subtitle: "mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300",

  form: "mt-6 space-y-4",

  label: "text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5",

  inputBase:
    "mt-2 w-full rounded-xl border bg-gray-50 dark:bg-slate-950/40 px-3 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm transition-colors focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20",
  inputNormal: "border-gray-200 dark:border-slate-700",
  inputError: "border-red-400 dark:border-red-500 focus-visible:ring-red-500",

  inputIcon:
    "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500",
  inputWithIconPadding: "pl-10",

  helperRow: "flex items-center justify-end",
  helperLink:
    "text-sm text-indigo-600 hover:text-indigo-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900 rounded-md",

  primaryButton:
    "w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium tracking-wide text-white shadow-sm transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900 disabled:opacity-60 disabled:cursor-not-allowed",

  footerText: "mt-5 text-sm text-slate-600 dark:text-slate-300",
  footerLink: "text-indigo-600 hover:underline font-semibold",

  dividerRow: "my-4 flex items-center gap-3",
  dividerLine: "h-px flex-1 bg-slate-200 dark:bg-slate-700",
  dividerText: "text-xs font-medium text-slate-500 dark:text-slate-400",

  ssoButton:
    "w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm font-medium text-slate-900 dark:text-white shadow-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900",
  ssoButtonInner: "flex items-center justify-center gap-2",

  errorBox:
    "rounded-xl border border-red-200 dark:border-red-700/50 bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-700 dark:text-red-300",

  rightPanel:
    "relative hidden md:flex flex-col items-center justify-center gap-6 p-10 overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-400 text-white",
  rightInner: "relative z-10 w-full max-w-lg flex flex-col items-center gap-6",
  glassCard:
    "rounded-2xl border border-white/25 bg-white/15 backdrop-blur shadow-sm",
  glassCardInner: "p-5",
  statGrid: "grid grid-cols-2 gap-3",
  statCard: "rounded-2xl border border-white/20 bg-white/10 py-4 text-center backdrop-blur",
  statValue: "text-2xl font-semibold",
  statLabel: "mt-1 text-xs text-white/80",

  rightTitle: "text-center text-3xl font-semibold tracking-tight",
  rightSubtitle: "text-center text-sm text-white/80",

  pill:
    "inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-2 text-xs text-white/90 backdrop-blur",

  decorationA:
    "pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10 opacity-10 blur-3xl",
  decorationB:
    "pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/10 opacity-10 blur-3xl",
};
