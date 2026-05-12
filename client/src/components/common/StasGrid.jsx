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
      title: "Active exams",
      subtitle: "Available to attempt",
      value: data.activeExams,
      color: "bg-blue-500",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      icon: Activity,
    },
    {
      title: "Completed",
      subtitle: "Exams finished",
      value: data.completedExams,
      color: "bg-green-500",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      icon: CheckCircle2,
    },
    {
      title: "Avg. score",
      subtitle: "Overall performance",
      value: `${parseFloat(data.averageScore).toFixed(1)}%`,
      color: "bg-amber-500",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      icon: Trophy,
    },
    {
      title: "Time spent",
      subtitle: "Across all exams",
      value: `${parseFloat(data.totalHours).toFixed(0)}m`,
      color: "bg-sky-500",
      iconBg: "bg-sky-100",
      iconColor: "text-sky-600",
      icon: Clock3,
    },
  ];

  return (
    <div className="sticky top-0 z-20 bg-[#f7f8fc] pb-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="
              relative
              overflow-hidden
              bg-white
              border
              border-gray-200
              rounded-2xl
              p-5
              min-h-[140px]
              hover:shadow-md
              transition-all
              duration-300
            "
          >

            {/* TOP BORDER */}
            <div
              className={`absolute top-0 left-0 w-full h-1 ${card.color}`}
            />

            {/* CONTENT */}
            <div className="flex flex-col justify-between h-full">

              {/* TOP */}
              <div className="flex items-start justify-between">

                {/* LEFT SIDE */}
                <div>

                  <div
                    className={`
                      w-11
                      h-11
                      rounded-xl
                      ${card.iconBg}
                      flex
                      items-center
                      justify-center
                      mb-4
                    `}
                  >
                    <Icon className={`w-5 h-5 ${card.iconColor}`} />
                  </div>

                  <p className="text-sm font-medium text-gray-500">
                    {card.title}
                  </p>

                </div>

                {/* VALUE */}
                <h2 className="text-[42px] leading-none font-semibold text-gray-900 tracking-tight">
                  {card.value}
                </h2>

              </div>

              {/* BOTTOM */}
              <div className="mt-4">

                <p className="text-sm text-gray-700 font-medium">
                  {card.subtitle}
                </p>

              </div>

            </div>

          </div>
        );
      })}

    </div>
  );
};

export default StatsGrid;