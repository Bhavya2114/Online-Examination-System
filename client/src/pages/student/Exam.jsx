import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import ManageExams from "../admin/ManageExams";
import { AuthContext } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import api from "../../api/axiosInstance";

const Exam = () => {
  const { user, triggerDashboardRefresh } = useContext(AuthContext);
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startError, setStartError] = useState(null);
  const [startingExamId, setStartingExamId] = useState(null);

  // For students - fetch active exams
  useEffect(() => {
    if (user?.role === "student") {
      fetchStudentExams();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchStudentExams = async () => {
    try {
      const response = await api.get("/exams");
      // Backend already filters exams based on time (startTime <= now <= endTime)
      setExams(response.data);
    } catch (error) {
      console.error("Error fetching exams:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = async (examId) => {
    try {
      setStartingExamId(examId);
      setStartError(null);

      const response = await api.post(`/exams/${examId}/start`);

      localStorage.setItem(
        "examSession",
        JSON.stringify({
          sessionId: response.data.sessionId,
          examId,
          expiresAt: response.data.expiresAt,
          startedAt: response.data.startedAt,
        })
      );

      triggerDashboardRefresh();
      navigate(`/exam/${examId}/attempt`);
    } catch (error) {
      console.error("Error starting exam:", error);
      setStartError(error.response?.data?.message || "Failed to start exam");
      setStartingExamId(null);
    }
  };

  // Admin view - manage exams
  if (user?.role === "admin" || user?.role === "owner") {
    return <ManageExams />;
  }

  // Student view - available exams
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Available Exams</h1>
      <p className="text-gray-500 mb-6">Attempt exams to test your knowledge</p>

      {startError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {startError}
        </div>
      )}

      {loading && (
        <div className="text-center py-12 text-gray-500">
          <p>Loading exams...</p>
        </div>
      )}

      {!loading && exams.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No exams available yet</p>
        </div>
      )}

      {!loading && exams.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map(exam => (
            <div
              key={exam._id}
              className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition"
            >
              <h3 className="font-semibold text-lg text-gray-800 mb-1">{exam.name}</h3>
              <p className="text-gray-500 text-sm capitalize mb-4">{exam.subject}</p>
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p><span className="font-medium">Duration:</span> {exam.duration} minutes</p>
                <p><span className="font-medium">Total Marks:</span> {exam.totalMarks}</p>
              </div>
              <button
                onClick={() => handleStartExam(exam._id)}
                disabled={startingExamId === exam._id}
                className="w-full bg-blue-600 text-white hover:bg-blue-700 font-medium py-2 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {startingExamId === exam._id ? "Starting..." : "Start Exam"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Exam;
