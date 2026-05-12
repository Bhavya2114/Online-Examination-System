import { useState, useEffect } from "react";
import api from "../../api/axiosInstance";
import { toast } from "react-toastify";

const AdminQuestionBank = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    questionText: "",
    subject: "",
    difficulty: "Medium",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "A"
  });

  // 📊 Fetch questions on mount
  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await api.get("/questions");
      setQuestions(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching questions:", err);
      setError(err.response?.data?.message || "Failed to fetch questions");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      questionText: "",
      subject: "",
      difficulty: "Medium",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctAnswer: "A"
    });
    setIsEditing(false);
    setSelectedQuestionId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (question) => {
    const options = question.options || [];
    const correctAnswer = ["A", "B", "C", "D"][question.correctOptionIndex] || "A";

    setFormData({
      questionText: question.questionText,
      subject: question.subject,
      difficulty: question.difficulty,
      optionA: options[0] || "",
      optionB: options[1] || "",
      optionC: options[2] || "",
      optionD: options[3] || "",
      correctAnswer
    });
    setIsEditing(true);
    setSelectedQuestionId(question._id);
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.questionText || !formData.subject || !formData.optionA || !formData.optionB || !formData.optionC || !formData.optionD) {
      toast.error("Please fill all required fields");
      return;
    }

    // Convert form data to API format
    const options = [formData.optionA, formData.optionB, formData.optionC, formData.optionD];
    const correctOptionIndex = ["A", "B", "C", "D"].indexOf(formData.correctAnswer);

    setSubmitting(true);

    try {
      const payload = {
        questionText: formData.questionText,
        subject: formData.subject,
        difficulty: formData.difficulty,
        options,
        correctOptionIndex
      };

      if (isEditing) {
        // Edit existing question
        await api.put(`/questions/${selectedQuestionId}`, payload);
        toast.success("Question updated successfully!");
      } else {
        // Create new question
        await api.post("/questions", payload);
        toast.success("Question created successfully!");
      }

      // Reset form and close modal
      resetForm();
      setShowModal(false);

      // Refresh question list
      fetchQuestions();
    } catch (err) {
      console.error("Error saving question:", err);
      toast.error(err.response?.data?.message || "Failed to save question");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (questionId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this question? This action cannot be undone."
    );

    if (confirmed) {
      deleteQuestion(questionId);
    }
  };

  const deleteQuestion = async (questionId) => {
    try {
      await api.delete(`/questions/${questionId}`);
      toast.success("Question deleted successfully!");
      fetchQuestions();
    } catch (err) {
      console.error("Error deleting question:", err);
      toast.error(err.response?.data?.message || "Failed to delete question");
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-700";
      case "Medium":
        return "bg-yellow-100 text-yellow-700";
      case "Hard":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header Section */}
      
      <div className="mb-8 flex items-center justify-between">

  {/* LEFT */}
  <div>

    <h1 className="text-[42px] leading-[1.1] font-bold tracking-[-1px] text-slate-900">
      Question Bank
    </h1>

    <p className="mt-2 text-[15px] text-slate-500">
      Manage and organize exam questions
    </p>

  </div>

  {/* RIGHT */}
  <button
    onClick={openCreateModal}
    className="h-12 px-6 rounded-2xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold shadow-sm transition-all duration-200"
  >
    + Create Question
  </button>

</div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12 text-gray-500">
          <p>Loading questions...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && questions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No questions yet</p>
          <button
            onClick={openCreateModal}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Create your first question
          </button>
        </div>
      )}

      {/* Question Cards Grid */}
      {!loading && questions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {questions.map(question => {
            const correctAnswer = ["A", "B", "C", "D"][question.correctOptionIndex] || "A";
            return (
              <div
                key={question._id}
                className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition flex flex-col h-full"
              >
                {/* Content Section */}
                <div className="flex-1">
                  {/* Question Text */}
                  <h3 className="font-semibold text-gray-800 mb-3 line-clamp-2">
                    {question.questionText}
                  </h3>

                  {/* Meta Info */}
                  <div className="flex gap-2 mb-4 flex-wrap">
                    <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded capitalize">
                      {question.subject}
                    </span>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${getDifficultyColor(question.difficulty)}`}>
                      {question.difficulty}
                    </span>
                  </div>

                  {/* Options Preview */}
                  <div className="space-y-1 text-xs text-gray-600 mb-4">
                    {question.options?.map((option, idx) => {
                      const answer = ["A", "B", "C", "D"][idx];
                      const isCorrect = idx === question.correctOptionIndex;
                      return (
                        <p key={idx} className={isCorrect ? "font-semibold text-green-600" : ""}>
                          <span className="font-medium">{answer}.</span> {option}
                        </p>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => openEditModal(question)}
                    className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium py-2 rounded-lg transition text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(question._id)}
                    className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 font-medium py-2 rounded-lg transition text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          {/* Modal */}
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {isEditing ? "Edit Question" : "Create Question"}
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
              {/* Question Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question Text <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="questionText"
                  value={formData.questionText}
                  onChange={handleInputChange}
                  placeholder="Enter the question"
                  rows="4"
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
                  placeholder="e.g., Mathematics, Java"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Difficulty Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty Level <span className="text-red-500">*</span>
                </label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Options <span className="text-red-500">*</span>
                </label>

                {["A", "B", "C", "D"].map(letter => (
                  <input
                    key={letter}
                    type="text"
                    name={`option${letter}`}
                    value={formData[`option${letter}`]}
                    onChange={handleInputChange}
                    placeholder={`Option ${letter}`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ))}
              </div>

              {/* Correct Answer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correct Answer <span className="text-red-500">*</span>
                </label>
                <select
                  name="correctAnswer"
                  value={formData.correctAnswer}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
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
                  {submitting ? (isEditing ? "Updating..." : "Creating...") : (isEditing ? "Update" : "Save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuestionBank;
