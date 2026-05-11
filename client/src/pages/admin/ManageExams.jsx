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

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    duration: "",
    totalMarks: "",
    passingMarks: "",
    negativeMarking: false,
    startTime: "",
    endTime: ""
  });

  // Question Modal State
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [questionsData, setQuestionsData] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [savingQuestions, setSavingQuestions] = useState(false);
  const [currentExamForQuestions, setCurrentExamForQuestions] = useState(null);

  // 📊 Fetch draft exams on mount
  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await api.get("/exams?status=draft");

      // Show only draft exams for management
      setExams(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching exams:", err);
      setError(err.response?.data?.message || "Failed to fetch exams");
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async (subject) => {
    try {
      setLoadingQuestions(true);
      const response = await api.get("/questions");

      // Filter questions by subject
      const filteredQuestions = response.data.filter(
        q => q.subject.toLowerCase() === subject.toLowerCase()
      );

      setQuestionsData(filteredQuestions);
    } catch (err) {
      console.error("Error fetching questions:", err);
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
      endTime: ""
    });
    setIsEditing(false);
    setSelectedExamId(null);
  };

  const pad2 = (value) => String(value).padStart(2, "0");

  // Helper function to format date for datetime-local input in local time
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
    setFormData({
      name: exam.name,
      subject: exam.subject,
      duration: exam.duration.toString(),
      totalMarks: exam.totalMarks.toString(),
      passingMarks: exam.passingMarks.toString(),
      negativeMarking: exam.negativeMarking || false,
      startTime: formatDateForInput(exam.startTime),
      endTime: formatDateForInput(exam.endTime)
    });
    setIsEditing(true);
    setSelectedExamId(exam._id);
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.subject || !formData.duration || !formData.totalMarks || !formData.passingMarks) {
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
        status: "draft"
      };

      if (isEditing) {
        // Edit existing exam
        await api.put(`/exams/${selectedExamId}`, payload);
        toast.success("Exam updated successfully!");
      } else {
        // Create new exam
        await api.post("/exams", payload);
        toast.success("Exam created successfully as draft!");
      }

      // Reset form and close modal
      resetForm();
      setShowModal(false);

      // Refresh exam list
      fetchExams();
    } catch (err) {
      console.error("Error saving exam:", err);
      toast.error(err.response?.data?.message || "Failed to save exam");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (examId, examName) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this exam? This action cannot be undone."
    );

    if (confirmed) {
      deleteExam(examId);
    }
  };

  const deleteExam = async (examId) => {
    try {
      await api.delete(`/exams/${examId}`);
      toast.success("Exam deleted successfully!");
      fetchExams();
    } catch (err) {
      console.error("Error deleting exam:", err);
      toast.error(err.response?.data?.message || "Failed to delete exam");
    }
  };

  const handleAddQuestion = (exam) => {
    setCurrentExamForQuestions(exam);
    setSelectedQuestions([]);
    setIsQuestionModalOpen(true);

    // Fetch questions for this exam's subject
    fetchQuestions(exam.subject);
  };

  const toggleQuestionSelection = (questionId) => {
    setSelectedQuestions(prev => {
      if (prev.includes(questionId)) {
        return prev.filter(id => id !== questionId);
      } else {
        return [...prev, questionId];
      }
    });
  };

  const handleSaveQuestions = async () => {
    if (selectedQuestions.length === 0) {
      toast.error("Please select at least one question");
      return;
    }

    setSavingQuestions(true);

    try {
      await api.put(`/exams/${currentExamForQuestions._id}/add-questions`, {
        questionIds: selectedQuestions
      });

      toast.success(`${selectedQuestions.length} question(s) added successfully!`);

      // Close modal and refresh exams
      setIsQuestionModalOpen(false);
      setSelectedQuestions([]);
      setCurrentExamForQuestions(null);
      fetchExams();
    } catch (err) {
      console.error("Error adding questions:", err);
      toast.error(err.response?.data?.message || "Failed to add questions");
    } finally {
      setSavingQuestions(false);
    }
  };

  const handleDeactivate = async (examId, examName) => {
    try {
      const response = await api.put(`/exams/${examId}/deactivate`);
      toast.success("Exam deactivated successfully!");
      fetchExams();
    } catch (err) {
      console.error("Deactivate Error:", err);
      toast.error(err.response?.data?.message || "Failed to deactivate exam");
    }
  };

  const handleActivate = async (exam) => {
    // Validate questions exist
    if (!exam.questions || exam.questions.length === 0) {
      toast.error("Add at least one question before activating this exam.");
      return;
    }

    try {
      await api.put(`/exams/${exam._id}/activate`);
      toast.success("Exam activated successfully!");
      fetchExams();
    } catch (err) {
      console.error("Error activating exam:", err);
      toast.error(err.response?.data?.message || "Failed to activate exam");
    }
  };

  // 🎯 Role-based Dashboard Title
  const roleTitles = {
    admin: "Admin Dashboard",
    student: "Student Dashboard",
    owner: "Owner Dashboard"
  };

  const dashboardTitle = roleTitles[user?.role] || "Dashboard";

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{dashboardTitle} - Manage Exams</h1>
          <p className="text-gray-500 text-sm mt-1">Create, activate, and manage exams</p>
        </div>

        {/* Create New Exam Button */}
        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg transition-all"
        >
          + Create New Exam
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12 text-gray-500">
          <p>Loading exams...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && exams.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No exams yet</p>
          <button
            onClick={openCreateModal}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Create your first exam
          </button>
        </div>
      )}

      {/* Exam Cards Grid */}
      {!loading && exams.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map(exam => {
            // Use examState from backend (fully automatic lifecycle)
            const examState = exam.examState || 'draft';
            const isDraft = examState === 'draft';
            const isDraftExpired = examState === 'draft_expired';
            const isActive = examState === 'active';
            const isCompleted = examState === 'completed';

            const attemptCount = exam.attemptCount || 0;
            const hasAttempts = attemptCount > 0;
            const hasQuestions = (exam.questions?.length || 0) > 0;

            // Role-based permissions
            const isOwner = user?.role === 'owner';
            const isCreator = exam.createdBy?._id === user?._id || exam.createdBy === user?._id;
            const isAdmin = user?.role === 'admin';

            // Button visibility logic (automatic lifecycle - no manual activation)
            // DRAFT: Show Edit, Delete, Add Question
            // DRAFT_EXPIRED: Show Edit, Delete only (must reschedule before adding questions)
            const showEdit = (isDraft || isDraftExpired) && !hasAttempts;
            const showDelete = (isDraft || isDraftExpired) && !hasAttempts;
            const showAddQuestion = isDraft && !hasAttempts; // Only normal draft, not expired

            // View Results: show for active with attempts, or completed
            const showViewResults = (isActive && hasAttempts) || isCompleted;

            return (
              <div
                key={exam._id}
                className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition"
              >
                {/* Header with Badge */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-800">{exam.name}</h3>
                    <p className="text-gray-500 text-sm capitalize">{exam.subject}</p>
                  </div>

                  {/* Status badges based on examState */}
                  {isDraft && (
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-yellow-100 text-yellow-700 whitespace-nowrap ml-2">
                      DRAFT
                    </span>
                  )}
                  {isDraftExpired && (
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-red-100 text-red-700 whitespace-nowrap ml-2">
                      EXPIRED
                    </span>
                  )}
                  {isActive && (
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-green-100 text-green-700 whitespace-nowrap ml-2 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                      ACTIVE
                    </span>
                  )}
                  {isCompleted && (
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-gray-100 text-gray-700 whitespace-nowrap ml-2">
                      COMPLETED
                    </span>
                  )}
                </div>

                {/* Exam Details */}
                <div className="space-y-2 text-sm text-gray-600">
                  <p><span className="font-medium">Duration:</span> {exam.duration} minutes</p>
                  <p><span className="font-medium">Total Marks:</span> {exam.totalMarks}</p>
                  <p><span className="font-medium">Passing Marks:</span> {exam.passingMarks}</p>
                  <p><span className="font-medium">Total Questions:</span> {exam.questions?.length || 0}</p>
                  <p><span className="font-medium">Attempts:</span> {attemptCount}</p>
                  {exam.startTime && (
                    <p><span className="font-medium">Start:</span> {new Date(exam.startTime).toLocaleString()}</p>
                  )}
                  {exam.endTime && (
                    <p><span className="font-medium">End:</span> {new Date(exam.endTime).toLocaleString()}</p>
                  )}
                  {exam.negativeMarking && (
                    <p><span className="font-medium">Negative Marking:</span> Enabled</p>
                  )}
                  {/* Show creator info for non-creator admins */}
                  {isAdmin && !isCreator && exam.createdBy?.name && (
                    <p className="text-blue-600">
                      <span className="font-medium">Created by:</span> {exam.createdBy.name}
                    </p>
                  )}
                </div>

                {/* Actions - Dynamic Button Logic */}
                <div className="mt-4 flex gap-2 flex-col">
                  {/* DRAFT EXAMS (including expired) */}
                  {(isDraft || isDraftExpired) && (
                    <>
                      <div className="flex gap-2">
                        {showEdit && (
                          <button
                            onClick={() => openEditModal(exam)}
                            className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium py-2 rounded-lg transition"
                          >
                            Edit
                          </button>
                        )}
                        {showDelete ? (
                          <button
                            onClick={() => handleDelete(exam._id, exam.name)}
                            className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 font-medium py-2 rounded-lg transition"
                          >
                            Delete
                          </button>
                        ) : (
                          <button
                            disabled
                            className="flex-1 bg-gray-100 text-gray-400 font-medium py-2 rounded-lg cursor-not-allowed"
                            title="Cannot delete after attempts"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                      {showAddQuestion && (
                        <button
                          onClick={() => handleAddQuestion(exam)}
                          className="w-full bg-green-100 text-green-700 hover:bg-green-200 font-medium py-2 rounded-lg transition"
                        >
                          + Add Question
                        </button>
                      )}
                      {isDraftExpired && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700">
                          ⚠️ <strong>Expired:</strong> This exam's time has passed. Please reschedule to a future time before adding questions.
                        </div>
                      )}
                    </>
                  )}

                  {/* ACTIVE EXAMS - Show message only */}
                  {isActive && !hasAttempts && (
                    <p className="text-xs text-gray-500 text-center italic py-2">
                      Exam is now active and available to students
                    </p>
                  )}

                  {/* ACTIVE EXAMS - HAS ATTEMPTS */}
                  {isActive && hasAttempts && (
                    <>
                      <p className="text-xs text-green-600 text-center font-medium py-2">
                        \ud83d\udfe2 Live - Students are attempting
                      </p>
                      {showViewResults && (
                        <button
                          onClick={() => window.location.href = `/admin/results/${exam._id}`}
                          className="w-full bg-purple-50 text-purple-600 hover:bg-purple-100 font-medium py-2 rounded-lg transition"
                        >
                          View Results
                        </button>
                      )}
                    </>
                  )}

                  {/* COMPLETED EXAMS */}
                  {isCompleted && showViewResults && (
                    <button
                      onClick={() => window.location.href = `/admin/results/${exam._id}`}
                      className="w-full bg-purple-50 text-purple-600 hover:bg-purple-100 font-medium py-2 rounded-lg transition"
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

              {/* Negative Marking Checkbox */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  name="negativeMarking"
                  id="negativeMarking"
                  checked={formData.negativeMarking}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="negativeMarking" className="text-sm font-medium text-gray-700">
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
                  {submitting ? (isEditing ? "Updating..." : "Creating...") : (isEditing ? "Update" : "Save as Draft")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Question Selection Modal */}
      {isQuestionModalOpen && currentExamForQuestions && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          {/* Modal */}
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Add Questions</h2>
                <p className="text-gray-500 text-sm mt-1">Exam: {currentExamForQuestions.name}</p>
              </div>
              <button
                onClick={() => {
                  setIsQuestionModalOpen(false);
                  setSelectedQuestions([]);
                  setCurrentExamForQuestions(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Loading State */}
            {loadingQuestions && (
              <div className="text-center py-12 text-gray-500">
                <p>Loading questions...</p>
              </div>
            )}

            {/* Questions Grid */}
            {!loadingQuestions && (
              <>
                {questionsData.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>No questions available for subject: {currentExamForQuestions.subject}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {questionsData.map(question => (
                      <div
                        key={question._id}
                        onClick={() => toggleQuestionSelection(question._id)}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition ${selectedQuestions.includes(question._id)
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 bg-white hover:shadow-md"
                          }`}
                      >
                        <p className="text-sm font-medium text-gray-800 line-clamp-3">
                          {question.questionText}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Footer */}
            {!loadingQuestions && questionsData.length > 0 && (
              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Selected: {selectedQuestions.length}</span> Question{selectedQuestions.length !== 1 ? "s" : ""}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setIsQuestionModalOpen(false);
                      setSelectedQuestions([]);
                      setCurrentExamForQuestions(null);
                    }}
                    disabled={savingQuestions}
                    className="bg-gray-200 text-gray-700 hover:bg-gray-300 font-medium px-5 py-2 rounded-lg transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveQuestions}
                    disabled={savingQuestions || selectedQuestions.length === 0}
                    className="bg-blue-600 text-white hover:bg-blue-700 font-medium px-5 py-2 rounded-lg transition disabled:opacity-50"
                  >
                    {savingQuestions ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageExams;

