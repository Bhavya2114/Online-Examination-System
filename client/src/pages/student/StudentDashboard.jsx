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

  // � Exam states
  const [exams, setExams] = useState([]);
  const [examsLoading, setExamsLoading] = useState(true);
  const [examsError, setExamsError] = useState(null);
  // 📊 Recent Results states
  const [recentResults, setRecentResults] = useState([]);
  const [recentResultsLoading, setRecentResultsLoading] = useState(true);
  const [recentResultsError, setRecentResultsError] = useState(null);
  const fetchDashboardData = useCallback(async () => {
    if (!user) return;

    setStatsLoading(true);
    setExamsLoading(true);
    setRecentResultsLoading(true);

    const [statsResult, examsResult, recentResultsResult] = await Promise.allSettled([
      api.get("/student/dashboard"),
      api.get("/student/dashboard/exams"),
      api.get("/student/dashboard/recent-results"),
    ]);

    if (statsResult.status === "fulfilled") {
      setStats(statsResult.value.data);
      setStatsError(null);
    } else {
      console.error("Error fetching dashboard stats:", statsResult.reason);
      setStatsError(
        statsResult.reason?.response?.data?.message || "Failed to fetch stats"
      );
    }

    if (examsResult.status === "fulfilled") {
      setExams(examsResult.value.data || []);
      setExamsError(null);
    } else {
      console.error("Error fetching exams:", examsResult.reason);
      setExamsError(
        examsResult.reason?.response?.data?.message || "Failed to fetch exams"
      );
      setExams([]);
    }

    if (recentResultsResult.status === "fulfilled") {
      setRecentResults(recentResultsResult.value.data || []);
      setRecentResultsError(null);
    } else {
      console.error("Error fetching recent results:", recentResultsResult.reason);
      setRecentResultsError(
        recentResultsResult.reason?.response?.data?.message || "Failed to fetch recent results"
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
    <div className="bg-gray-50">
      {/* Content Area */}
      <div className="p-6">

        {/* Stats Grid */}
        {statsLoading ? (
          <div className="text-center py-8 text-gray-500">Loading statistics...</div>
        ) : statsError ? (
          <div className="text-center py-8 text-red-500">{statsError}</div>
        ) : (
          <StatsGrid stats={stats} />
        )}

        {/* Exams and Results Section */}
        <div className="grid grid-cols-3 gap-6 mt-6">

          {/* Left Side - Exams */}
          <div className="col-span-2">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Exams</h2>

            {examsLoading ? (
              <div className="text-center py-8 text-gray-500">
                <p>Loading exams...</p>
              </div>
            ) : examsError ? (
              <div className="text-center py-8 text-red-500">
                <p>{examsError}</p>
              </div>
            ) : exams.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No exams available at this time</p>
              </div>
            ) : (
              exams.map(exam => (
                <div key={exam._id} className="bg-white rounded-lg shadow-sm p-6 mb-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{exam.name}</h3>
                      <p className="text-sm text-gray-500">Subject Code: {exam.subject.toUpperCase()}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      Available
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Date</p>
                      <p className="text-sm font-medium text-gray-800">
                        {new Date(exam.startTime).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">End Time</p>
                      <p className="text-sm font-medium text-gray-800">
                        {new Date(exam.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Duration</p>
                      <p className="text-sm font-medium text-gray-800">{exam.duration} minutes</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Total Marks: <span className="font-semibold text-gray-800">{exam.totalMarks}</span></p>
                    </div>
                    <button
                      onClick={() => navigate(`/exam/${exam._id}`)}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                      Start Exam
                    </button>
                  </div>
                </div>
              ))
            )}

          </div>

          {/* Right Side - Recent Results */}
          <div className="col-span-1">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Results</h2>

            {recentResultsLoading ? (
              <div className="text-center py-8 text-gray-500">
                <p>Loading results...</p>
              </div>
            ) : recentResultsError ? (
              <div className="text-center py-8 text-red-500">
                <p>{recentResultsError}</p>
              </div>
            ) : recentResults.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No tests attempted yet</p>
              </div>
            ) : (
              recentResults.map((result) => {
                const percentage = result.percentage;
                const textColor = percentage >= 50 ? 'text-green-600' : 'text-red-600';
                const bgColor = percentage >= 50 ? 'bg-green-500' : 'bg-red-500';

                return (
                  <div key={result._id} className="bg-white rounded-lg shadow-sm p-5 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-semibold text-gray-800">{result.exam.name}</h3>
                      <span className={`text-lg font-bold ${textColor}`}>{percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className={`${bgColor} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Completed: {new Date(result.createdAt).toLocaleDateString()}</p>
                  </div>
                );
              })
            )}

          </div>

        </div>

      </div>

    </div>
  );
};

export default StudentDashboard;
