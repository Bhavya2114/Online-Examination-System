import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import Loader from "../../components/common/Loader";
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
        api.get("/admin/results/summary")
      ]);

      setStats(statsResponse.data);
      setSummary(summaryResponse.data || []);
      setError(null);
    } catch (err) {
      console.error("Admin results fetch error:", err);
      setError(err.response?.data?.message || "Failed to load admin results");
      toast.error(err.response?.data?.message || "Failed to load admin results");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center text-red-600">
            {error}
          </div>
        </div>
      </div>
    );
  }

  const safeStats = stats || {
    totalExamsConducted: 0,
    totalSubmissions: 0,
    platformAveragePercentage: 0,
    overallPassRate: 0
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Results Analytics</h1>
          <p className="text-gray-600 mt-2">
            Review exam performance and student outcomes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <p className="text-sm font-medium text-gray-600">Total Exams</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {safeStats.totalExamsConducted}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <p className="text-sm font-medium text-gray-600">Total Submissions</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {safeStats.totalSubmissions}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <p className="text-sm font-medium text-gray-600">Platform Average %</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {safeStats.platformAveragePercentage}%
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <p className="text-sm font-medium text-gray-600">Overall Pass Rate</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {safeStats.overallPassRate}%
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Exam Summary</h2>
            <p className="text-sm text-gray-600 mt-1">
              Exam-wise performance overview
            </p>
          </div>

          <div className="p-6">
            {summary.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No results available yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-gray-600">
                      <th className="px-4 py-3 border-b">Exam Title</th>
                      <th className="px-4 py-3 border-b">Total Attempts</th>
                      <th className="px-4 py-3 border-b">Average %</th>
                      <th className="px-4 py-3 border-b">Pass Count</th>
                      <th className="px-4 py-3 border-b">Fail Count</th>
                      <th className="px-4 py-3 border-b">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.map((item) => (
                      <tr key={item.examId} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-800 font-medium">
                          {item.examTitle || "Untitled Exam"}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {item.totalAttempts}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {item.averagePercentage ?? 0}%
                        </td>
                        <td className="px-4 py-3 text-green-700">
                          {item.passCount}
                        </td>
                        <td className="px-4 py-3 text-red-700">
                          {item.failCount}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => navigate(`/admin/results/${item.examId}`)}
                            className="px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                          >
                            View Results
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
      </div>
    </div>
  );
};

export default AdminResults;
