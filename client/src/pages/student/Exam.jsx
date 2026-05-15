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
  const [startingExamId, setStartingExamId] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

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
      console.log("API Response Data:", response.data);
      console.log("Number of exams received:", response.data?.length || 0);
      setExams(response.data);
    } catch (error) {
      console.error("Error fetching exams:", error);
      console.error("Error response:", error.response);
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = async (examId) => {
    try {
      setStartingExamId(examId);

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
      setStartingExamId(null);
    }
  };

  // Admin view - manage exams
  if (user?.role === "admin" || user?.role === "owner") {
    return <ManageExams />;
  }

  const now = new Date();

const examsWithState = exams.map((exam) => {

  let examState = exam.status || "draft";

  if (
    new Date(exam.startTime) <= now &&
    new Date(exam.endTime) >= now
  ) {
    examState = "active";
  }

  if (new Date(exam.endTime) < now) {
    examState = "completed";
  }

  return {
    ...exam,
    examState,
  };
});

console.log("examsWithState:", examsWithState);

const filteredExams = examsWithState.filter((exam) => {

  if (activeTab === "all") return true;

  return exam.examState === activeTab;
});

console.log("activeTab:", activeTab);
console.log("filteredExams:", filteredExams);

  // Student view - available exams
  // Student view - available exams
return (
  <div className="px-5 lg:px-7 py-5">

    {/* HEADER */}
    <div className="mb-7">

      <h1 className="text-[42px] leading-[1.1] font-bold tracking-[-1px] text-slate-900">
        Available Exams
      </h1>

      <p className="mt-2 text-[15px] text-slate-500">
        Attempt exams to test your knowledge
      </p>

    </div>


    {/* LOADING */}
    {loading && (
      <div className="flex items-center justify-center py-20 text-slate-500">
        Loading exams...
      </div>
    )}

    

    {/* FILTER TABS */}
<div className="flex items-center gap-3 mb-7 flex-wrap">

  {[
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "scheduled", label: "Scheduled" },
    { key: "completed", label: "Completed" },
  ].map((tab) => (
    <button
      key={tab.key}
      onClick={() => setActiveTab(tab.key)}
      className={`
        px-5
        h-11
        rounded-2xl
        text-sm
        font-semibold
        transition-all
        duration-200
        border

        ${
          activeTab === tab.key
            ? "bg-violet-600 text-white border-violet-600 shadow-md scale-105"
            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
        }
      `}
    >
      {tab.label}
    </button>
  ))}

</div>

{/* EMPTY */}
    {!loading && filteredExams.length === 0 && (
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

        <h3 className="text-xl font-semibold text-slate-800">
          No Exams Available
        </h3>

        <p className="mt-2 text-slate-500">
          Please check back later.
        </p>

      </div>
    )}

    {/* EXAMS */}
    {!loading && filteredExams?.length > 0 && (
      <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">

        {filteredExams.map((exam) => {

          const now = new Date();

          const endTime = new Date(exam.endTime);

          const remainingMs = endTime - now;

          const remainingHours = Math.max(
            0,
            Math.floor(remainingMs / (1000 * 60 * 60))
          );

          return (
            <div
              key={exam._id}
              className={`
  bg-white
  border-2
  rounded-3xl
  overflow-hidden
  shadow-sm
  hover:shadow-lg
  transition-all
  duration-300

  ${
  exam.examState === "active"
    ? "border-green-200"
    : exam.examState === "completed"
    ? "border-green-200"
    : exam.examState === "result-pending"
    ? "border-orange-200"
    : "border-violet-200"
}
`}>

              {/* TOP */}
<div className="p-6 border-b border-slate-100">

  <div className="flex items-start justify-between gap-4">

    <div className="min-w-0">

      <h3 className="text-[30px] leading-tight font-bold text-slate-900">
        {exam.name}
      </h3>

      <p className="mt-2 text-sm text-slate-500 capitalize">
        Subject: {exam.subject}
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
  exam.examState === "active"
    ? "bg-green-100 text-green-700"
    : exam.examState === "completed"
    ? "bg-green-100 text-green-700"
    : exam.examState === "result-pending"
    ? "bg-orange-100 text-orange-700"
    : "bg-violet-100 text-violet-700"
}
      `}
    >
      {exam.examState === "active"
  ? "Active"
  : exam.examState === "completed"
  ? "Completed"
  : exam.examState === "result-pending"
  ? "Result awaited"
  : "Scheduled"}

    </span>

  </div>

  {/* META */}
  <div
  className={`
    grid
    gap-3
    mt-6
    ${
      exam.examState === "completed"
        ? "grid-cols-2"
        : "grid-cols-3"
    }
  `}
>

  <div className="bg-slate-50 rounded-2xl p-4">

    <p className="text-xs text-slate-500 mb-1">
      Duration
    </p>

    <h4 className="font-semibold text-slate-800">
      {exam.duration} mins
    </h4>

  </div>

  <div className="bg-slate-50 rounded-2xl p-4">

    <p className="text-xs text-slate-500 mb-1">
      Total marks
    </p>

    <h4 className="font-semibold text-slate-800">
      {exam.totalMarks}
    </h4>

  </div>

  {exam.examState !== "completed" && (
    <div className="bg-slate-50 rounded-2xl p-4">

      <p className="text-xs text-slate-500 mb-1">
        Ends in
      </p>

      <h4 className="font-semibold text-slate-800">
        {remainingHours}h
      </h4>

    </div>
  )}


</div>


</div>
              

              {/* FOOTER */}
              <div className="p-6">

                <div className="flex items-center justify-between gap-4">

                  <div>

                    <p className="text-xs text-slate-500 mb-1">
                      End Time
                    </p>

                    <h5 className="font-semibold text-slate-800 text-sm">
                      {new Date(exam.endTime).toLocaleString()}
                    </h5>

                  </div>
{exam.examState === "active" ? (
  <button
    onClick={() => {
      if (!exam.hasSubmitted) {
        handleStartExam(exam._id);
      }
    }}
    disabled={
      startingExamId === exam._id ||
      exam.hasSubmitted
    }
    className={`
      h-[54px]
      min-w-[140px]
      px-8
      rounded-2xl
      text-[18px]
      font-semibold
      transition-all
      duration-200
      border

      ${
        exam.hasSubmitted
          ? `
            border-slate-100
            bg-slate-100
            text-slate-400
            cursor-not-allowed
            opacity-70
            shadow-none
          `
          : `
            border-green-500
            bg-green-500
            text-white
            hover:bg-green-600
            hover:border-green-600
            hover:scale-105
            shadow-sm
          `
      }
    `}
  >
    {startingExamId === exam._id
      ? "Starting..."
      : "▷ Start"}
  </button>
) : (
  <div />
)}


                </div>

              </div>

            </div>
          );
        })}

      </div>
    )}

  </div>
);
};

export default Exam;
