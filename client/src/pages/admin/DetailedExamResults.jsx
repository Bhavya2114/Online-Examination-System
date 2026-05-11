import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axiosInstance";
import Loader from "../../components/common/Loader";
import { toast } from "react-hot-toast";

const DetailedExamResults = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchExamResults();
  }, [examId]);

  const fetchExamResults = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/results/${examId}`);
      setResults(response.data || []);
      setError(null);
    } catch (err) {
      console.error("Exam results fetch error:", err);
      setError(err.response?.data?.message || "Failed to load exam results");
      toast.error(err.response?.data?.message || "Failed to load exam results");
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Exam Results</h1>
            <p className="text-gray-600 mt-2">
              Detailed student submissions
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/results")}
            className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-100 transition"
          >
            Back to Results
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Student Submissions</h2>
          </div>

          <div className="p-6">
            {results.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No submissions found for this exam.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-gray-600">
                      <th className="px-4 py-3 border-b">Student Name</th>
                      <th className="px-4 py-3 border-b">Email</th>
                      <th className="px-4 py-3 border-b">Score</th>
                      <th className="px-4 py-3 border-b">Percentage</th>
                      <th className="px-4 py-3 border-b">Status</th>
                      <th className="px-4 py-3 border-b">Time</th>
                      <th className="px-4 py-3 border-b">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((row, index) => (
                      <tr key={`${row.email}-${index}`} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-800 font-medium">
                          {row.studentName}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{row.email}</td>
                        <td className="px-4 py-3 text-gray-700">{row.score}</td>
                        <td className="px-4 py-3 text-gray-700">{row.percentage}%</td>
                        <td className={`px-4 py-3 ${row.status === "Passed" ? "text-green-700" : "text-red-700"}`}>
                          {row.status}
                        </td>
                        <td className="px-4 py-3 text-gray-700">{row.timeTaken}</td>
                        <td className="px-4 py-3 text-gray-700">
                          {new Date(row.createdAt).toLocaleString()}
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

export default DetailedExamResults;
