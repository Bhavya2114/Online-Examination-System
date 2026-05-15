import { useState, useEffect } from "react";
import api from "../../api/axiosInstance";
import { toast } from "react-toastify";
import useAuth from "../../hooks/useAuth";

const ManageExams = () => {
  const { user } = useAuth();

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    duration: "",
    totalMarks: "",
    passingMarks: "",
    negativeMarking: false,
    startTime: "",
    endTime: "",
  });

  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [questionsData, setQuestionsData] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [savingQuestions, setSavingQuestions] = useState(false);
  const [currentExamForQuestions, setCurrentExamForQuestions] =
    useState(null);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);

      const response = await api.get("/exams?status=draft");

      setExams(response.data);
      setError(null);
    } catch (err) {
      console.error(err);

      setError(err.response?.data?.message || "Failed to fetch exams");
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async (subject) => {
    try {
      setLoadingQuestions(true);

      const response = await api.get("/questions");

      const filteredQuestions = response.data.filter(
        (q) => q.subject.toLowerCase() === subject.toLowerCase()
      );

      setQuestionsData(filteredQuestions);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch questions");
    } finally {
      setLoadingQuestions(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      subject: "",
      duration: "",
      totalMarks: "",
      passingMarks: "",
      negativeMarking: false,
      startTime: "",
      endTime: "",
    });

    setIsEditing(false);
    setSelectedExamId(null);
  };

  const pad2 = (value) => String(value).padStart(2, "0");

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = pad2(date.getMonth() + 1);
    const day = pad2(date.getDate());
    const hours = pad2(date.getHours());
    const minutes = pad2(date.getMinutes());

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const toUtcISOString = (datetimeLocalValue) => {
    if (!datetimeLocalValue) return "";

    return new Date(datetimeLocalValue).toISOString();
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (exam) => {
  console.log("Editing exam:", exam);

  setFormData({
    name: exam.name || "",
    subject: exam.subject || "",
    duration: exam.duration?.toString() || "",
    totalMarks: exam.totalMarks?.toString() || "",
    passingMarks: exam.passingMarks?.toString() || "",
    negativeMarking: exam.negativeMarking || false,
    startTime: formatDateForInput(exam.startTime),
    endTime: formatDateForInput(exam.endTime),
  });

  setIsEditing(true);
  setSelectedExamId(exam._id);
  setShowModal(true);
};

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.subject ||
      !formData.duration ||
      !formData.totalMarks ||
      !formData.passingMarks
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!formData.startTime || !formData.endTime) {
      toast.error("Start Time and End Time are required");
      return;
    }

    if (new Date(formData.endTime) <= new Date(formData.startTime)) {
      toast.error("End Time must be after Start Time");
      return;
    }

    if (Number(formData.passingMarks) > Number(formData.totalMarks)) {
      toast.error("Passing marks cannot exceed total marks");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        subject: formData.subject,
        duration: Number(formData.duration),
        totalMarks: Number(formData.totalMarks),
        passingMarks: Number(formData.passingMarks),
        negativeMarking: formData.negativeMarking,
        startTime: toUtcISOString(formData.startTime),
        endTime: toUtcISOString(formData.endTime),
        status: "draft",
      };

      if (isEditing) {
        await api.put(`/exams/${selectedExamId}`, payload);

        toast.success("Exam updated successfully!");
      } else {
        await api.post("/exams", payload);

        toast.success("Exam created successfully!");
      }

      resetForm();
      setShowModal(false);

      fetchExams();
    } catch (err) {
      console.error(err);

      toast.error(err.response?.data?.message || "Failed to save exam");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (examId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this exam?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/exams/${examId}`);

      toast.success("Exam deleted successfully!");

      fetchExams();
    } catch (err) {
      console.error(err);

      toast.error(err.response?.data?.message || "Failed to delete exam");
    }
  };

  const handleAddQuestion = (exam) => {
    setCurrentExamForQuestions(exam);

    setSelectedQuestions([]);

    setIsQuestionModalOpen(true);

    fetchQuestions(exam.subject);
  };

  const toggleQuestionSelection = (questionId) => {
    setSelectedQuestions((prev) => {
      if (prev.includes(questionId)) {
        return prev.filter((id) => id !== questionId);
      }

      return [...prev, questionId];
    });
  };

  const handleSaveQuestions = async () => {
    if (selectedQuestions.length === 0) {
      toast.error("Please select at least one question");
      return;
    }

    setSavingQuestions(true);

    try {
      await api.put(
        `/exams/${currentExamForQuestions._id}/add-questions`,
        {
          questionIds: selectedQuestions,
        }
      );

      toast.success("Questions added successfully!");

      setIsQuestionModalOpen(false);
      setSelectedQuestions([]);
      setCurrentExamForQuestions(null);

      fetchExams();
    } catch (err) {
      console.error(err);

      toast.error(err.response?.data?.message || "Failed to add questions");
    } finally {
      setSavingQuestions(false);
    }
  };

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-[42px] leading-[1.1] font-bold tracking-[-1px] text-slate-900">
            Manage Exams
          </h1>

          <p className="mt-2 text-[15px] text-slate-500">
            Create, activate, and manage exams
          </p>

        </div>

        <button
          onClick={openCreateModal}
          className="h-12 px-6 rounded-2xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold shadow-sm transition-all duration-200"
        >
          + Create New Exam
        </button>

      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-20 text-slate-500">
          Loading exams...
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600">
          {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && exams.length === 0 && (
        <div className="bg-white rounded-[30px] border border-slate-200/70 p-16 text-center">
          <p className="text-slate-500 mb-4">No exams found</p>

          <button
            onClick={openCreateModal}
            className="text-[#2563eb] font-semibold"
          >
            Create your first exam
          </button>
        </div>
      )}

      {/* Exam Cards */}
      {!loading && exams.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">

          {exams.map((exam) => {
            const examState = exam.status || "draft";

const isDraft = examState === "draft";
const isDraftExpired = examState === "draft_expired";
const isActive = examState === "active";
const isCompleted = examState === "completed";

            const attemptCount = exam.attemptCount || 0;

            const showEdit =
              (isDraft || isDraftExpired) && attemptCount === 0;

            const showDelete =
              (isDraft || isDraftExpired) && attemptCount === 0;

            const showAddQuestion =
              isDraft && attemptCount === 0;

            return (
              <div
                key={exam._id}
                className="bg-white rounded-[30px] border border-slate-200/70 shadow-sm hover:shadow-md transition-all duration-300 p-6"
              >

                {/* Top */}
                <div className="flex items-start justify-between mb-5">

                  <div>

                    <h3 className="text-[24px] font-bold text-slate-900">
                      {exam.name}
                    </h3>

                    <p className="text-slate-500 mt-1 capitalize">
                      {exam.subject}
                    </p>

                  </div>

                  {isDraft && (
                    <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-yellow-100 text-yellow-700">
                      Draft
                    </span>
                  )}

                  {isDraftExpired && (
                    <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-red-100 text-red-700">
                      Expired
                    </span>
                  )}

                  {isActive && (
                    <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-green-100 text-green-700">
                      Active
                    </span>
                  )}

                  {isCompleted && (
                    <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700">
                      Completed
                    </span>
                  )}

                </div>

                {/* Details */}
                <div className="space-y-3 text-[15px] text-slate-600">

                  <p>
                    <span className="font-semibold text-slate-800">
                      Duration:
                    </span>{" "}
                    {exam.duration} minutes
                  </p>

                  <p>
                    <span className="font-semibold text-slate-800">
                      Total Marks:
                    </span>{" "}
                    {exam.totalMarks}
                  </p>

                  <p>
                    <span className="font-semibold text-slate-800">
                      Passing Marks:
                    </span>{" "}
                    {exam.passingMarks}
                  </p>

                  <p>
                    <span className="font-semibold text-slate-800">
                      Questions:
                    </span>{" "}
                    {exam.questions?.length || 0}
                  </p>

                  <p>
  <span className="font-semibold text-slate-800">
    Start:
  </span>{" "}
  {new Date(exam.startTime).toLocaleString()}
</p>

<p>
  <span className="font-semibold text-slate-800">
    End:
  </span>{" "}
  {new Date(exam.endTime).toLocaleString()}
</p>

                  {!isDraft && (
  <p>
    <span className="font-semibold text-slate-800">
      Attempts:
    </span>{" "}
    {attemptCount}
  </p>
)}

                </div>

                {/* Actions */}
<div className="mt-6 space-y-3">

  {(isDraft || isDraftExpired) && (
    <>
      {/* Top Buttons */}
      <div className="flex gap-3">

        <button
          onClick={() => handleAddQuestion(exam)}
          className="flex-1 h-11 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold transition-all duration-200"
        >
          + Add Question
        </button>

        <button
          onClick={() => openEditModal(exam)}
          className="flex-1 h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 text-blue-600 font-semibold transition-all duration-200"
        >
          Edit
        </button>

      </div>

      {/* Delete */}
      <button
        onClick={() => handleDelete(exam._id)}
        className="w-full h-11 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-all duration-200"
      >
        Delete Exam
      </button>
    </>
  )}

  {(isActive || isCompleted) && (
    <button
      onClick={() =>
        (window.location.href = `/admin/results/${exam._id}`)
      }
      className="w-full h-11 rounded-2xl bg-violet-50 hover:bg-violet-100 text-violet-700 font-semibold transition-all duration-200"
    >
      View Results
    </button>
  )}

</div>

              </div>
            );
          })}

        </div>
      )}

{/* Create/Edit Exam Modal */}
{showModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">

    {/* Modal */}
    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">

        <h2 className="text-2xl font-bold text-gray-800">
          {isEditing ? "Edit Exam" : "Create New Exam"}
        </h2>

        <button
          onClick={() => {
            setShowModal(false);
            resetForm();
          }}
          className="text-gray-400 hover:text-gray-600 text-2xl"
        >
          ✕
        </button>

      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Exam Name */}
        <div>

          <label className="block text-sm font-medium text-gray-700 mb-1">
            Exam Name <span className="text-red-500">*</span>
          </label>

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., Mid Term Examination"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

        </div>

        {/* Subject */}
        <div>

          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subject <span className="text-red-500">*</span>
          </label>

          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            placeholder="e.g., Mathematics, Programming"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

        </div>

        {/* Duration */}
        <div>

          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duration (minutes) <span className="text-red-500">*</span>
          </label>

          <input
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleInputChange}
            placeholder="e.g., 60"
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

        </div>

        {/* Total Marks */}
        <div>

          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total Marks <span className="text-red-500">*</span>
          </label>

          <input
            type="number"
            name="totalMarks"
            value={formData.totalMarks}
            onChange={handleInputChange}
            placeholder="e.g., 100"
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

        </div>

        {/* Passing Marks */}
        <div>

          <label className="block text-sm font-medium text-gray-700 mb-1">
            Passing Marks <span className="text-red-500">*</span>
          </label>

          <input
            type="number"
            name="passingMarks"
            value={formData.passingMarks}
            onChange={handleInputChange}
            placeholder="e.g., 40"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

        </div>

        {/* Start & End Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date & Time <span className="text-red-500">*</span>
            </label>

            <input
              type="datetime-local"
              name="startTime"
              value={formData.startTime}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date & Time <span className="text-red-500">*</span>
            </label>

            <input
              type="datetime-local"
              name="endTime"
              value={formData.endTime}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>

        </div>

        {/* Negative Marking */}
        <div className="flex items-center gap-2 pt-2">

          <input
            type="checkbox"
            name="negativeMarking"
            id="negativeMarking"
            checked={formData.negativeMarking}
            onChange={handleInputChange}
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />

          <label
            htmlFor="negativeMarking"
            className="text-sm font-medium text-gray-700"
          >
            Negative Marking
          </label>

        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">

          <button
            type="button"
            onClick={() => {
              setShowModal(false);
              resetForm();
            }}
            disabled={submitting}
            className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300 font-medium py-2 rounded-lg transition disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-blue-600 text-white hover:bg-blue-700 font-medium py-2 rounded-lg transition disabled:opacity-50"
          >
            {submitting
              ? isEditing
                ? "Updating..."
                : "Creating..."
              : isEditing
              ? "Update"
              : "Save as Draft"}
          </button>

        </div>

      </form>

    </div>

  </div>
)}
{/* Question Modal */}
{isQuestionModalOpen && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">

    <div className="bg-white w-full max-w-3xl rounded-3xl p-6 max-h-[90vh] overflow-y-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">

        <h2 className="text-2xl font-bold">
          Add Questions
        </h2>

        <button
          onClick={() => setIsQuestionModalOpen(false)}
          className="text-2xl text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

      </div>

      {/* Loading */}
      {loadingQuestions ? (
        <p>Loading questions...</p>
      ) : questionsData.length === 0 ? (
        <p>No questions found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

          {questionsData.map((question) => (

  <div
    key={question._id}
    className={`border rounded-2xl p-4 transition-all cursor-pointer hover:shadow-md
      ${
        selectedQuestions.includes(question._id)
          ? "border-emerald-500 bg-emerald-50"
          : "border-slate-200 bg-white"
      }`}
    onClick={() => toggleQuestionSelection(question._id)}
  >

    {/* Top */}
    <div className="flex items-start justify-between gap-3">

      <div className="flex gap-3">

        <input
          type="checkbox"
          checked={selectedQuestions.includes(question._id)}
          onChange={() =>
            toggleQuestionSelection(question._id)
          }
          onClick={(e) => e.stopPropagation()}
          className="mt-1"
        />

        <div>

          <h3 className="font-semibold text-slate-800 leading-snug">
            {question.questionText}
          </h3>

          <p className="text-sm text-slate-500 mt-1 capitalize">
            {question.subject}
          </p>

        </div>

      </div>

      {/* Difficulty Badge */}
      <span
  className={`text-xs font-semibold px-3 py-1 rounded-xl whitespace-nowrap
    ${
      question.difficulty?.toLowerCase() === "easy"
        ? "bg-green-100 text-green-700"
        : question.difficulty?.toLowerCase() === "medium"
        ? "bg-yellow-100 text-yellow-700"
        : "bg-red-100 text-red-700"
    }`}
>
  {question.difficulty}
</span>

    </div>

  </div>

))}

        </div>
      )}

      {/* Footer */}
      <div className="flex gap-3 mt-6">

        <button
          onClick={() => setIsQuestionModalOpen(false)}
          className="flex-1 h-11 rounded-xl bg-gray-200"
        >
          Cancel
        </button>

        <button
          onClick={handleSaveQuestions}
          disabled={savingQuestions}
          className="flex-1 h-11 rounded-xl bg-emerald-600 text-white"
        >
          {savingQuestions
            ? "Saving..."
            : "Save Questions"}
        </button>

      </div>

    </div>

  </div>
)}
    </div>
  );
};

export default ManageExams;