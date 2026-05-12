import { useState, useEffect, useMemo } from "react";
import {
  CheckCircle2,
  Eye,
  Trophy,
  XCircle,
  FileText,
} from "lucide-react";

import api from "../../api/axiosInstance";
import { toast } from "react-hot-toast";

import ResultReviewModal from "../../components/student/ResultReviewModal";

const Results = () => {
  const [selectedResultId, setSelectedResultId] = useState(null);

  const [results, setResults] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    fetchMyResults();
  }, []);

  const fetchMyResults = async () => {
    try {
      setLoading(true);

      const response = await api.get("/results/my-results");

      setResults(response.data?.results || []);

      setError(null);

    } catch (err) {
      console.error("Error fetching my results:", err);

      setError(
        err.response?.data?.message ||
          "Failed to fetch results"
      );

      toast.error("Failed to load results");

    } finally {
      setLoading(false);
    }
  };

 const filteredResults = useMemo(() => {

  // Only show results whose exam time has ended
  const completedResults = results.filter(
    (result) =>
      result.endTime &&
      new Date(result.endTime) < new Date()
  );

  if (activeFilter === "All") {
    return completedResults;
  }

  return completedResults.filter(
    (result) => result.status === activeFilter
  );

}, [results, activeFilter]);

  const stats = useMemo(() => {

  // Only count exams whose time has ended
  const completedResults = results.filter(
    (result) =>
      result.endTime &&
      new Date(result.endTime) < new Date()
  );

  const total = completedResults.length;

  const passed = completedResults.filter(
    (r) => r.status === "Passed"
  ).length;

  const failed = completedResults.filter(
    (r) => r.status === "Failed"
  ).length;

  const average =
    total > 0
      ? (
          completedResults.reduce(
            (acc, curr) =>
              acc + Number(curr.percentage || 0),
            0
          ) / total
        ).toFixed(0)
      : 0;

  return {
    total,
    passed,
    failed,
    average,
  };

}, [results]);

  const statCards = [
    {
      title: "Exams taken",
      value: stats.total,
      icon: FileText,
      color: "text-indigo-600",
      bg: "bg-indigo-100",
    },
    {
      title: "Avg. score",
      value: `${stats.average}%`,
      icon: Trophy,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
    {
      title: "Passed",
      value: stats.passed,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      title: "Failed",
      value: stats.failed,
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-100",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500">
        Loading results...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="px-5 lg:px-7 py-5">

      {/* HEADER */}
      <div className="mb-7">

        <h1 className="text-[42px] leading-[1.1] font-bold tracking-[-1px] text-slate-900">
          My Results
        </h1>

        <p className="mt-2 text-[15px] text-slate-500">
          Exams you have submitted
        </p>

      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">

        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="
                bg-white
                rounded-3xl
                border
                border-slate-200
                px-5
                py-5
                shadow-sm
              "
            >

              <div className="flex items-start justify-between">

                <div>

                  <div
                    className={`
                      w-12
                      h-12
                      rounded-2xl
                      flex
                      items-center
                      justify-center
                      ${card.bg}
                    `}
                  >
                    <Icon
                      className={`w-5 h-5 ${card.color}`}
                    />
                  </div>

                  <p className="mt-4 text-sm text-slate-500 font-medium">
                    {card.title}
                  </p>

                </div>

                <h2 className="text-[42px] font-bold text-slate-900 leading-none">
                  {card.value}
                </h2>

              </div>

            </div>
          );
        })}

      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">

        <div className="flex items-center gap-2">

          {["All", "Passed", "Failed"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`
                px-4
                py-2
                rounded-full
                text-sm
                font-medium
                transition-all
                duration-200
                ${
                  activeFilter === filter
                    ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }
              `}
            >
              {filter}
            </button>
          ))}

        </div>

        <p className="text-sm text-slate-500 font-medium">
          {filteredResults.length} results found
        </p>

      </div>

      {/* EMPTY */}
      {filteredResults.length === 0 ? (
        <div
          className="
            bg-white
            rounded-3xl
            border
            border-slate-200
            py-20
            text-center
          "
        >

          <p className="text-slate-500 text-lg">
            No results found.
          </p>

        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">

          {filteredResults.map((result) => {



  return (
            <div
              key={result.resultId}
              className="
                bg-white
                border
                border-slate-200
                rounded-3xl
                overflow-hidden
                shadow-sm
                hover:shadow-md
                transition-all
                duration-300
              "
            >

              {/* TOP */}
              <div className="p-6 border-b border-slate-100">

                <div className="flex items-start justify-between gap-4">

                  <div className="min-w-0">

                    <h3 className="text-[24px] font-bold text-slate-900 leading-tight truncate">
                      {result.examName}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500 capitalize">
                      Subject: {result.subject}
                      {" • "}
                      {result.duration} mins
                    </p>

                  </div>

                  <span
                    className={`
                      px-3
                      py-1
                      rounded-full
                      text-xs
                      font-semibold
                      shrink-0
                      ${
                        result.status === "Passed"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }
                    `}
                  >
                    {result.status}
                  </span>

                </div>

                {/* SCORE */}
                <div className="mt-6">

                  <div className="flex items-center justify-between mb-2">

                    <h4 className="text-[30px] font-bold text-slate-900">
                      {result.score}
                      <span className="text-slate-400 text-xl font-medium">
                        /{result.totalMarks}
                      </span>
                    </h4>

                    <span
                      className={`
                        px-3
                        py-1
                        rounded-full
                        text-sm
                        font-semibold
                        ${
                          result.status === "Passed"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }
                      `}
                    >
                      {result.percentage}%
                    </span>

                  </div>

                  {/* PROGRESS */}
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">

                    <div
                      className={`
                        h-full rounded-full
                        ${
                          result.status === "Passed"
                            ? "bg-emerald-500"
                            : "bg-red-500"
                        }
                      `}
                      style={{
                        width: `${result.percentage}%`,
                      }}
                    />

                  </div>

                </div>

              </div>

              {/* DETAILS */}
              <div className="p-6">

                <div className="grid grid-cols-2 gap-3">

                  <div className="bg-slate-50 rounded-2xl p-4">

                    <p className="text-xs text-slate-500 mb-1">
                      Total marks
                    </p>

                    <h5 className="font-semibold text-slate-800">
                      {result.totalMarks}
                    </h5>

                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4">

                    <p className="text-xs text-slate-500 mb-1">
                      Submitted
                    </p>

                    <h5 className="font-semibold text-slate-800 text-sm">
                      {new Date(
                        result.submittedAt
                      ).toLocaleDateString()}
                    </h5>

                  </div>

                </div>

                {/* BUTTON */}
                <button
  type="button"
  onClick={() =>
    setSelectedResultId(result.resultId)
  }
  className="
    mt-5
    w-full
    h-12
    rounded-2xl
    border
    border-slate-300
    bg-white
    text-slate-800
    font-semibold
    text-sm
    flex
    items-center
    justify-center
    gap-2
    hover:bg-slate-50
    transition-all
    duration-200
  "
>
  <Eye className="w-4 h-4" />
  View result
</button>

              </div>

            </div>
          );
        })}
        </div>
      )}

      {/* MODAL */}
      {selectedResultId && (
        <ResultReviewModal
          resultId={selectedResultId}
          onClose={() =>
            setSelectedResultId(null)
          }
        />
      )}

    </div>
  );
};

export default Results;