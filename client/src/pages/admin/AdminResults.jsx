import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Users,
  ChartColumn,
  BadgePercent,
  ArrowRight,
} from "lucide-react";

import api from "../../api/axiosInstance";
import Loader from "../../components/common/Loader";
import Topbar from "../../components/common/Topbar";
import { toast } from "react-hot-toast";

const AdminResults = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResultsData();
  }, []);

  const fetchResultsData = async () => {
    try {
      setLoading(true);

      const [statsResponse, summaryResponse] = await Promise.all([
        api.get("/admin/results/stats"),
        api.get("/admin/results/summary"),
      ]);

      setStats(statsResponse.data);
      setSummary(summaryResponse.data || []);
      setError(null);
    } catch (err) {
      console.error("Admin results fetch error:", err);

      setError(
        err.response?.data?.message || "Failed to load admin results"
      );

      toast.error(
        err.response?.data?.message || "Failed to load admin results"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="w-full py-2">
        <div className="bg-white border border-red-200 rounded-[24px] p-6 text-center text-red-600 shadow-sm">
          {error}
        </div>
      </div>
    );
  }

  const safeStats = stats || {
    totalExamsConducted: 0,
    totalSubmissions: 0,
    platformAveragePercentage: 0,
    overallPassRate: 0,
  };

  const statCards = [
    {
      title: "Total exams",
      value: safeStats.totalExamsConducted,
      icon: FileText,
      iconBg: "bg-violet-100",
      iconColor: "text-violet-600",
    },
    {
      title: "Total submissions",
      value: safeStats.totalSubmissions,
      icon: Users,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Platform average",
      value: `${safeStats.platformAveragePercentage}%`,
      icon: ChartColumn,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
    },
    {
      title: "Overall pass rate",
      value: `${safeStats.overallPassRate}%`,
      icon: BadgePercent,
      iconBg: "bg-red-100",
      iconColor: "text-red-500",
    },
  ];

  return (
    <div className="w-full h-full overflow-hidden flex flex-col">

      
      <Topbar
  title="Results analytics"
  subtitle="Review exam performance and student outcomes"
/>

      {/* Analytics Cards */}
<div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon;

          return (
            <div
              key={index}
              className="
                bg-white
                rounded-[24px]
                border border-[#e5e7eb]
                p-5
                shadow-sm
                hover:shadow-md
                transition-all
                duration-300
              "
            >

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-[42px] leading-none font-semibold text-[#111827]">
                    {card.value}
                  </p>

                  <p className="text-sm text-[#4b5563] mt-3">
                    {card.title}
                  </p>
                </div>

                <div
                  className={`
                    w-12 h-12 rounded-2xl flex items-center justify-center
                    ${card.iconBg}
                  `}
                >
                  <Icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>

              </div>

            </div>
          );
        })}

      </div>

      {/* Summary Table */}
      <div className="bg-white rounded-[28px] border border-[#e5e7eb] shadow-sm overflow-hidden flex flex-col h-[580px]">

        {/* Header */}
        <div className="px-7 py-5 border-b border-[#ececec] flex items-center justify-between">

          <h2 className="text-[24px] font-semibold text-[#111827]">
            Exam summary
          </h2>

          <p className="text-sm text-[#6b7280]">
            Exam-wise performance overview
          </p>

        </div>

        {/* Empty State */}
        {summary.length === 0 ? (

          <div className="py-16 text-center text-[#6b7280]">
            No results available yet.
          </div>

        ) : (

          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto dashboard-scrollbar">

            <table className="min-w-full">

              <thead className="bg-[#fafafa]">

                <tr className="border-b border-[#ececec]">

                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#374151]">
                    Exam title
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#374151]">
                    Attempts
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#374151]">
                    Average %
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#374151]">
                    Passed
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#374151]">
                    Failed
                  </th>

                  <th className="px-6 py-4 text-right text-sm font-semibold text-[#374151]">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {summary.map((item) => (

                  <tr
                    key={item.examId}
                    className="
                      border-b border-[#f1f1f1]
                      hover:bg-[#fafafa]
                      transition-colors
                    "
                  >

                    <td className="px-6 py-5">

                      <p className="font-semibold text-[#111827]">
                        {item.examTitle || "Untitled Exam"}
                      </p>

                    </td>

                    <td className="px-6 py-5 text-[#374151]">
                      {item.totalAttempts}
                    </td>

                    <td className="px-6 py-5">

                      <span className="
                        inline-flex items-center
                        px-3 py-1
                        rounded-full
                        bg-red-50
                        text-red-600
                        text-xs
                        font-semibold
                      ">
                        {item.averagePercentage ?? 0}%
                      </span>

                    </td>

                    <td className="px-6 py-5">

                      <span className="
                        inline-flex items-center justify-center
                        min-w-[32px] h-[32px]
                        rounded-full
                        bg-green-100
                        text-green-700
                        text-sm
                        font-semibold
                      ">
                        {item.passCount}
                      </span>

                    </td>

                    <td className="px-6 py-5">

                      <span className="
                        inline-flex items-center justify-center
                        min-w-[32px] h-[32px]
                        rounded-full
                        bg-red-100
                        text-red-600
                        text-sm
                        font-semibold
                      ">
                        {item.failCount}
                      </span>

                    </td>

                    <td className="px-6 py-5 text-right">

                      <button
                        onClick={() =>
                          navigate(`/admin/results/${item.examId}`)
                        }
                        className="
                          inline-flex items-center gap-2
                          px-5 py-3
                          rounded-2xl
                          border border-[#d4d4d8]
                          bg-white
                          text-[#111827]
                          font-semibold
                          hover:bg-[#fafafa]
                          transition-all
                          duration-200
                        "
                      >
                        View results
                        <ArrowRight className="w-4 h-4" />
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
};

export default AdminResults;