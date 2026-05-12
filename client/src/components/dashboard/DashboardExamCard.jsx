const DashboardExamCard = ({ exam }) => {
  const isActive = exam.status === "active";

  const createdDate = exam.createdAt
    ? new Date(exam.createdAt).toLocaleDateString()
    : "N/A";

  const questionCount = Array.isArray(exam.questions)
    ? exam.questions.length
    : 0;

  return (
    <div
      className="
        group
        bg-white
        rounded-[28px]
        border border-slate-200/70
        p-6
        shadow-[0_10px_40px_rgba(15,23,42,0.04)]
        hover:shadow-[0_18px_60px_rgba(15,23,42,0.10)]
        hover:-translate-y-1
        transition-all
        duration-300
      "
    >

      {/* Top */}
      <div className="flex items-start justify-between gap-4 mb-6">

        <div>
          <h3
            className="
              text-[18px]
              font-semibold
              tracking-tight
              text-slate-900
              leading-snug
              transition-colors
              duration-300
              group-hover:text-violet-700
            "
          >
            {exam.name}
          </h3>

          <p className="text-sm text-slate-500 capitalize mt-1">
            {exam.subject}
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
            isActive
              ? "bg-emerald-100 text-emerald-700"
              : "bg-violet-100 text-violet-700"
          }`}
        >
          {isActive ? "✓ Active" : "• Completed"}
        </span>

      </div>

      {/* Info */}
      <div className="space-y-4">

        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">
            Created
          </span>

          <span className="font-medium text-slate-900">
            {createdDate}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">
            Duration
          </span>

          <span className="font-medium text-slate-900">
            {exam.duration} min
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">
            Questions
          </span>

          <span className="font-medium text-slate-900">
            {questionCount}
          </span>
        </div>

      </div>

      {/* Bottom Progress */}
      <div className="mt-7">

        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-500">
            Progress
          </span>

          <span className="text-xs font-semibold text-slate-700">
            75%
          </span>
        </div>

        <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">

          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isActive
                ? "bg-emerald-500"
                : "bg-violet-500"
            }`}
            style={{ width: "75%" }}
          />

        </div>

      </div>

    </div>
  );
};

export default DashboardExamCard;