import {
  Activity,
  CheckCircle2,
  Clock3,
  Trophy,
} from "lucide-react";

const StatsGrid = ({ stats }) => {
  const defaultStats = {
    activeExams: 0,
    completedExams: 0,
    averageScore: 0,
    totalHours: 0,
  };

  const data = stats || defaultStats;

  const cards = [
    {
      title: "Active Exams",
      subtitle: "Running now",
      value: data.activeExams,
      color: "bg-blue-500",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      icon: Activity,
    },
    {
      title: "Completed",
      subtitle: "Finished tests",
      value: data.completedExams,
      color: "bg-emerald-500",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      icon: CheckCircle2,
    },
    {
      title: "Avg. Score",
      subtitle: "Overall performance",
      value: `${parseFloat(data.averageScore).toFixed(1)}%`,
      color: "bg-violet-500",
      iconBg: "bg-violet-100",
      iconColor: "text-violet-600",
      icon: Trophy,
    },
    {
      title: "Hours Total",
      subtitle: "Exam duration",
      value: parseFloat(data.totalHours).toFixed(1),
      color: "bg-orange-500",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      icon: Clock3,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="group relative overflow-hidden rounded-[28px] bg-white border border-slate-200/70 px-6 py-5 shadow-[0_10px_35px_rgba(15,23,42,0.04)] hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)] transition-all duration-300"
          >

            {/* Top Accent */}
            <div
              className={`absolute top-0 left-0 w-full h-1 ${card.color}`}
            />

            {/* Soft Glow */}
            <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-slate-100/40 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Content Row */}
            <div className="relative z-10 flex items-center justify-between gap-4">

              {/* LEFT SIDE */}
              <div className="flex items-center gap-4 min-w-0">

                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-2xl ${card.iconBg} flex items-center justify-center shadow-sm shrink-0`}
                >
                  <Icon className={`w-7 h-7 ${card.iconColor}`} />
                </div>

                {/* Text */}
                <div className="min-w-0">

                  <p className="text-[15px] font-semibold text-slate-800 tracking-tight">
                    {card.title}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {card.subtitle}
                  </p>

                </div>

              </div>

              {/* RIGHT SIDE */}
              <div className="shrink-0">

                <h2 className="text-[52px] leading-none font-semibold tracking-tight text-slate-900">
                  {card.value}
                </h2>

              </div>

            </div>

          </div>
        );
      })}

    </div>
  );
};

export default StatsGrid;