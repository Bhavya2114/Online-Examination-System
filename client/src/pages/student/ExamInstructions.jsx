import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import { AuthContext } from "../../context/AuthContext";
import { ArrowLeft, FileText, ArrowRight } from "lucide-react";

const ExamInstructions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, triggerDashboardRefresh } = useContext(AuthContext);

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/exams/${id}`);
        setExam(response.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load exam details");
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [id]);

  const handleStartExam = async () => {
    try {
      setStarting(true);
      setError(null);

      const response = await api.post(`/exams/${id}/start`);

      localStorage.setItem(
        "examSession",
        JSON.stringify({
          sessionId: response.data.sessionId,
          examId: id,
          expiresAt: response.data.expiresAt,
          startedAt: response.data.startedAt,
        })
      );

      triggerDashboardRefresh();

      navigate(`/exam/${id}/attempt`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to start exam");
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100">
        <p className="text-gray-500 text-lg">Loading exam details...</p>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100">
        <p className="text-red-500 text-lg">{error || "Exam not found"}</p>
      </div>
    );
  }

  const formattedDeadline = exam.endTime
    ? new Date(exam.endTime).toLocaleString()
    : "N/A";

  const hasNegative = exam.negativeMarking && exam.negativeMarking > 0;

  return (
    <div className="fixed inset-0 bg-gray-200/60 backdrop-blur-sm flex items-center justify-center p-8">

      {/* Main Container (overflow-hidden removed) */}
      <div className="bg-white w-[96%] max-w-[1400px] mx-auto rounded-2xl shadow-xl">

        {/* ===== Header (rounded top) ===== */}
        <div className="flex justify-between items-center px-8 py-3 bg-gray-50 rounded-t-2xl">
          <div className="font-semibold text-lg text-gray-800">
            EduEx Portal
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-700">
            <span>{user?.name}</span>
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
              {user?.name?.charAt(0)}
            </div>
          </div>
        </div>

        {/* ===== Body ===== */}
        <div className="px-12 py-6">

          {/* Back Button (Improved) */}
          <button
            onClick={() => navigate("/dashboard")}
            className="group text-base font-medium text-black mb-6 flex items-center gap-2 transition-all duration-200"
          >
            <ArrowLeft
              size={18}
              className="transition-all duration-200"
            />
            <span className="transition-all duration-200 group-hover:font-semibold group-hover:scale-105">
              Back to dashboard
            </span>
          </button>

          {/* Hand Icon */}
          <div className="mb-4">
            <img
              src="/src/assets/handemoji.png"
              alt="Hand emoji"
              className="h-9 w-9"
            />
          </div>

          <h2 className="text-2xl font-semibold mb-2">
            Hello, {user?.name}!
          </h2>

          <p className="text-gray-600 mb-6">
            Please attend the test. Good luck.
          </p>

          <div className="my-8 border-t border-gray-200" />

          {/* Exam Title */}
          <h3 className="text-xl font-bold mb-4">
            {exam.name}
          </h3>

          {/* Exam Info */}
          <div className="flex flex-wrap items-center gap-10 text-gray-700 mb-4 text-sm">

            <div>
              <span className="font-semibold">Duration:</span>{" "}
              {exam.duration} Minutes
            </div>

            <div>
              <span className="font-semibold">Total Marks:</span>{" "}
              {exam.totalMarks}
            </div>

            <div>
              <span className="font-semibold">Negative Marking:</span>{" "}
              {hasNegative
                ? `-${exam.negativeMarking} per wrong answer`
                : "No Negative Marking"}
            </div>

            <div>
              <span className="font-semibold">Deadline:</span>{" "}
              {formattedDeadline}
            </div>

          </div>

          <p className="text-gray-600 mb-6 max-w-4xl">
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
            Totam tempore morbi non quam non parturient. In sit aliquet
            scelerisque purus sit maecenas. Nisi vivamus varius sagittis
            at amet pretium. Massa quam enim euismod nisl in sit.
          </p>

          <button
            onClick={handleStartExam}
            disabled={starting}
            className="bg-blue-600 text-white px-6 py-2 rounded-md transition-all duration-200 hover:bg-blue-700 hover:scale-105 active:scale-100 disabled:opacity-50"
          >
            {starting ? "Starting..." : "Let’s start the exam"}
          </button>

          <div className="my-8 border-t border-gray-200" />

          {/* Instructions */}
          <div>
            <h4 className="text-lg font-semibold mb-5 flex items-center gap-3">
              <FileText size={22} />
              Instructions
            </h4>

            <div className="space-y-4 text-gray-700 text-sm">

              <div className="flex items-start gap-3">
                <ArrowRight size={18} className="mt-1 text-gray-500" />
                <p>Please keep your camera on during the exam.</p>
              </div>

              <div className="flex items-start gap-3">
                <ArrowRight size={18} className="mt-1 text-gray-500" />
                <p>Lorem ipsum dolor sit amet consectetur. Viverra feugiat pellentesque aliquet quis turpis suspendisse.</p>
              </div>

              <div className="flex items-start gap-3">
                <ArrowRight size={18} className="mt-1 text-gray-500" />
                <p>Lorem ipsum dolor sit amet consectetur. Pulvinar vulputate ac ut ultrices risus ut nunc lobortis elit dignissim pulvinar.</p>
              </div>

              <div className="flex items-start gap-3">
                <ArrowRight size={18} className="mt-1 text-gray-500" />
                <p>Lorem ipsum dolor sit amet consectetur pellentesque.</p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ExamInstructions;