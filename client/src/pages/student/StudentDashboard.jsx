import { useCallback, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StatsGrid from "../../components/common/StasGrid";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/axiosInstance";

const StudentDashboard = () => {
  const { user, dashboardRefreshKey } = useContext(AuthContext);
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);

  const [exams, setExams] = useState([]);
  const [examsLoading, setExamsLoading] = useState(true);
  const [examsError, setExamsError] = useState(null);

  const [recentResults, setRecentResults] = useState([]);
  const [recentResultsLoading, setRecentResultsLoading] = useState(true);
  const [recentResultsError, setRecentResultsError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;

    setStatsLoading(true);
    setExamsLoading(true);
    setRecentResultsLoading(true);

    const [statsResult, examsResult, recentResultsResult] =
      await Promise.allSettled([
        api.get("/student/dashboard"),
        api.get("/student/dashboard/exams"),
        api.get("/student/dashboard/recent-results"),
      ]);

    // Stats
    if (statsResult.status === "fulfilled") {
      setStats(statsResult.value.data);
      setStatsError(null);
    } else {
      console.error("Error fetching dashboard stats:", statsResult.reason);

      setStatsError(
        statsResult.reason?.response?.data?.message ||
          "Failed to fetch stats"
      );
    }

    // Exams
    if (examsResult.status === "fulfilled") {
      setExams(examsResult.value.data || []);
      setExamsError(null);
    } else {
      console.error("Error fetching exams:", examsResult.reason);

      setExamsError(
        examsResult.reason?.response?.data?.message ||
          "Failed to fetch exams"
      );

      setExams([]);
    }

    // Results
    if (recentResultsResult.status === "fulfilled") {
      setRecentResults(recentResultsResult.value.data || []);
      setRecentResultsError(null);
    } else {
      console.error(
        "Error fetching recent results:",
        recentResultsResult.reason
      );

      setRecentResultsError(
        recentResultsResult.reason?.response?.data?.message ||
          "Failed to fetch recent results"
      );

      setRecentResults([]);
    }

    setStatsLoading(false);
    setExamsLoading(false);
    setRecentResultsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData, dashboardRefreshKey]);

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <div className="px-5 lg:px-7 pt-4 pb-6">

        {/* STATS */}
        {statsLoading ? (
          <div className="text-center py-10 text-gray-500">
            Loading statistics...
          </div>
        ) : statsError ? (
          <div className="text-center py-10 text-red-500">
            {statsError}
          </div>
        ) : (
          <StatsGrid stats={stats} />
        )}

        {/* MAIN CONTENT */}
        <div className="grid grid-cols-1 xl:grid-cols-[1.7fr_1fr] gap-5 mt-4 items-start">

          {/* LEFT SIDE */}
          <div>

            {/* SECTION HEADER */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Available exams
              </h2>

              
            </div>

            {/* EXAMS */}
            {examsLoading ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-gray-500">
                Loading exams...
              </div>
            ) : examsError ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-red-500">
                {examsError}
              </div>
            ) : exams.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-gray-500">
                No exams available
              </div>
            ) : (
              exams
  .filter((exam) => !exam.isAttempted)
  .map((exam) => (
                <div
                  key={exam._id}
                  className="
                    bg-white
                    border
                    border-gray-200
                    rounded-2xl
                    p-5
                    mb-5
                    hover:shadow-md
                    transition-all
                    duration-300
                  "
                >

                  {/* TOP */}
                  <div className="flex items-start justify-between mb-5">

                    <div>
                      <h3 className="text-xl font-semibold leading-tight text-gray-900">
                        {exam.name}
                      </h3>

                      <p className="text-sm text-gray-500 mt-1">
                        Subject: {exam.subject?.toUpperCase()}
                      </p>

                      
                    </div>

                    <span
  className={`
    px-3 py-1 text-xs font-medium rounded-full
    ${
      exam.isAttempted
        ? "bg-gray-100 text-gray-600"
        : "bg-green-100 text-green-700"
    }
  `}
>
  {exam.isAttempted ? "Completed" : "Available"}
</span>

                  </div>

                  {/* INFO GRID */}
                  <div className="grid grid-cols-3 gap-3 mb-5">

                    {/* DATE */}
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-1">
                        Date
                      </p>

                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(exam.startTime).toLocaleDateString()}
                      </p>
                    </div>

                    {/* END TIME */}
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-1">
                        End Time
                      </p>

                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(exam.endTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    {/* DURATION */}
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-1">
                        Duration
                      </p>

                      <p className="text-sm font-semibold text-gray-900">
                        {exam.duration} mins
                      </p>
                    </div>

                  </div>

                  {/* BOTTOM */}
                  <div className="flex items-center justify-between pt-1">

                    <div className="text-sm text-gray-500">
                      Total Marks :
                      <span className="font-semibold text-gray-900 ml-1">
                        {exam.totalMarks}
                      </span>
                    </div>

  {!exam.isAttempted && (
  <button
  onClick={() => navigate(`/exam/${exam._id}`)}
  className="
    h-[54px]
    px-6
    rounded-2xl
    border
    border-red-200
    bg-red-500
    hover:bg-red-600
    text-white
    text-base
    font-semibold
    flex
    items-center
    justify-center
    gap-2
    shadow-sm
    hover:shadow-xl
    hover:scale-[1.06]
    hover:-translate-y-1
    active:scale-[0.98]
    transition-all
    duration-300
  "
>

  <span className="text-lg">
    ▷
  </span>

  Start now

</button>
)}

                  </div>

                </div>
              ))
            )}

          </div>

          {/* RIGHT SIDE */}
          <div>

            {/* HEADER */}
            <div className="flex items-center justify-between mb-4">

              <h2 className="text-lg font-semibold text-gray-900">
                Recent results
              </h2>

              

            </div>

            {/* RESULTS CARD */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

              <div className="p-5 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">
                  My scores
                </h3>
              </div>

              {recentResultsLoading ? (
                <div className="p-6 text-center text-gray-500">
                  Loading results...
                </div>
              ) : recentResultsError ? (
                <div className="p-6 text-center text-red-500">
                  {recentResultsError}
                </div>
              ) : recentResults.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No tests attempted yet
                </div>
              ) : (
                recentResults.slice(0, 3).map((result) => {
                  const percentage = result.percentage;

                  const bgColor =
                    percentage >= 50
                      ? "bg-green-500"
                      : "bg-red-500";

                  return (
                    <div
                      key={result._id}
                      className="p-5 border-b border-gray-100 last:border-b-0"
                    >

                      {/* RESULT TOP */}
                      <div className="flex items-start justify-between mb-3">

                        <h3 className="text-sm font-semibold text-gray-900">
                          {result.exam.name}
                        </h3>

                        <span
                          className={`
                            px-3
                            py-1
                            rounded-full
                            text-xs
                            font-semibold
                            ${
                              percentage >= 50
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-600"
                            }
                          `}
                        >
                          {percentage}%
                        </span>

                      </div>

                      {/* PROGRESS */}
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className={`${bgColor} h-1.5 rounded-full`}
                          style={{
                            width: `${percentage}%`,
                          }}
                        ></div>
                      </div>

                      {/* DATE */}
                      <p className="text-xs text-gray-500 mt-3">
                        Completed ·{" "}
                        {new Date(result.createdAt).toLocaleDateString()}
                      </p>

                    </div>
                  );
                })
              )}

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;