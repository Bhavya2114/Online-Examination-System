import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";

const ExamAttempt = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const submitInProgress = useRef(false);
  const isProgrammaticExit = useRef(false);

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [questionStatus, setQuestionStatus] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Anti-cheating states - Unified violation tracking
  const [violationState, setViolationState] = useState({
    total: 0,
    tabSwitches: 0,
    fullscreenExits: 0
  });
  const [showViolationWarning, setShowViolationWarning] = useState(false);
  const [hasEnteredFullscreen, setHasEnteredFullscreen] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);

  // Fetch exam attempt data
  useEffect(() => {
    const fetchExam = async () => {
      const sessionRaw = localStorage.getItem("examSession");

      if (!sessionRaw) {
        navigate(`/exam/${id}`);
        return;
      }

      let session;
      try {
        session = JSON.parse(sessionRaw);
      } catch (err) {
        localStorage.removeItem("examSession");
        navigate(`/exam/${id}`);
        return;
      }

      if (session.examId && session.examId !== id) {
        navigate(`/exam/${id}`);
        return;
      }

      try {
        setLoading(true);
        const { data } = await api.get(`/exams/${id}/attempt`);
        setExam({
          name: data.name,
          duration: data.duration,
          totalMarks: data.totalMarks
        });
        setQuestions(data.questions || []);
        setTimeLeft(data.remainingSeconds || 0);
        setError(null);

        // Initialize question status for all questions
        const initialStatus = {};
        (data.questions || []).forEach(q => {
          initialStatus[q._id] = {
            visited: false,
            answered: false
          };
        });
        setQuestionStatus(initialStatus);
      } catch (err) {
        console.error("Error fetching exam attempt:", err);
        setError(err.response?.data?.message || "Unable to load exam attempt");
        navigate(`/exam/${id}`);
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [id, navigate]);

  // Timer logic
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Auto-submit when timer reaches zero
  useEffect(() => {
    // Guard clauses
    if (loading) return;
    if (questions.length === 0) return;
    if (timeLeft > 0) return;
    if (submitInProgress.current) return;

    // Timer has ended - auto submit
    console.warn('Time expired - Auto-submitting exam');
    handleSubmit(true);
  }, [timeLeft, loading]);

  // Mark question as visited when navigating to it
  useEffect(() => {
    if (!questions[currentIndex]) return;

    const currentQuestion = questions[currentIndex];
    setQuestionStatus(prev => ({
      ...prev,
      [currentQuestion._id]: {
        ...prev[currentQuestion._id],
        visited: true
      }
    }));
  }, [currentIndex, questions]);

  // Fullscreen enforcement
  useEffect(() => {
    // Only enforce if fullscreen API is supported
    if (!document.fullscreenEnabled) return;

    // Monitor fullscreen exits (do NOT request on mount)
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && hasEnteredFullscreen) {
        // Check if this is a programmatic exit (after submission)
        if (isProgrammaticExit.current) {
          isProgrammaticExit.current = false;
          return; // Do not count as violation
        }

        // User exited fullscreen after entering (manual ESC press)
        setViolationState(prev => ({
          total: prev.total + 1,
          tabSwitches: prev.tabSwitches,
          fullscreenExits: prev.fullscreenExits + 1
        }));
        setShowViolationWarning(true);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [hasEnteredFullscreen]);

  // Tab switch detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // User switched away from tab
        setViolationState(prev => ({
          total: prev.total + 1,
          tabSwitches: prev.tabSwitches + 1,
          fullscreenExits: prev.fullscreenExits
        }));
        setShowViolationWarning(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Unified auto-submit on 3 total violations
  useEffect(() => {
    if (violationState.total > 3 && !submitInProgress.current) {
      console.warn('Total violations reached 3 - Auto-submitting');
      console.log(`Violations: ${violationState.tabSwitches} tab switches, ${violationState.fullscreenExits} fullscreen exits`);
      handleSubmit(true);
    }
  }, [violationState.total]);

  // Ensure fullscreen on first interaction
  const ensureFullscreen = async () => {
    if (document.fullscreenElement) return;
    if (!document.fullscreenEnabled) return;

    try {
      await document.documentElement.requestFullscreen();
      setHasEnteredFullscreen(true);
    } catch (err) {
      console.warn('Fullscreen rejected:', err);
    }
  };

  // Format Time
  const formatTime = () => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Save Answer
  const handleSelectOption = (questionId, selectedIndex) => {
    ensureFullscreen();
    setAnswers((prev) => ({ ...prev, [questionId]: selectedIndex }));

    // Mark question as answered
    setQuestionStatus(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        answered: true
      }
    }));
  };

  // Clear Response
  const handleClearResponse = (questionId) => {
    // Remove answer
    setAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[questionId];
      return newAnswers;
    });

    // Mark as not answered
    setQuestionStatus(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        answered: false
      }
    }));
  };

  // Save & Next
  const handleSaveAndNext = () => {
    ensureFullscreen();
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  // Submit Exam
  const handleSubmit = async (isAuto = false) => {
    // Prevent double submission
    if (submitInProgress.current) return;
    submitInProgress.current = true;

    // Lock UI
    setIsSubmitting(true);

    const payload = Object.entries(answers).map(([questionId, selectedOptionIndex]) => ({
      questionId,
      selectedOptionIndex
    }));

    try {
      await api.post(`/exams/${id}/submit`, { answers: payload });

      // Exit fullscreen programmatically after successful submission
      if (document.fullscreenElement) {
        try {
          isProgrammaticExit.current = true;
          await document.exitFullscreen();
        } catch (err) {
          console.warn("Fullscreen exit failed:", err);
        }
      }

      localStorage.removeItem("examSession");
      setExamCompleted(true);
    } catch (err) {
      console.error("Error submitting exam:", err);
      setError(err.response?.data?.message || "Failed to submit exam");

      // Unlock UI on error
      submitInProgress.current = false;
      setIsSubmitting(false);

      if (isAuto) {
        setExamCompleted(true);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6">Loading...</div>
    );
  }

  if (!exam) {
    return (
      <div className="p-6 text-red-600">{error || "Exam not found"}</div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = questions.length
    ? ((currentIndex + 1) / questions.length) * 100
    : 0;

  return (
    <div className="w-full min-h-screen bg-gray-50">

      {/* Exam Completion Screen */}
      {examCompleted && (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white w-[500px] rounded-md shadow-md p-10 text-center">

            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Thank You for Taking Test.
            </h2>

            <button
              onClick={() => navigate('/results')}
              className="px-8 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
            >
              Close
            </button>

          </div>
        </div>
      )}

      {/* Main Exam UI - Only shown before completion */}
      {!examCompleted && (
        <div className="w-full min-h-screen bg-gray-50">

          {/* Unified Violation Warning Modal */}
          {showViolationWarning && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

              <div className="bg-white w-[520px] rounded-md shadow-lg text-center py-12 px-10">

                {/* Red X Circle */}
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-full border-4 border-red-500 flex items-center justify-center">
                    <span className="text-4xl text-red-500 font-bold">✕</span>
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-3xl font-serif text-gray-800 mb-6">
                  Warning
                </h2>

                {/* Message */}
                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  Test Warning {violationState.total} : During the Test You are not
                  allowed to Navigate to any Other Window. Your Test Will be
                  closed and auto submitted.
                </p>

                {/* OK Button */}
                <button
                  onClick={() => setShowViolationWarning(false)}
                  className="px-8 py-2 border border-black rounded-md hover:bg-gray-100 transition"
                >
                  OK
                </button>

              </div>
            </div>
          )}

          {/* Main Exam Container - Blur when violation warning is active */}
          <div className={showViolationWarning ? 'pointer-events-none blur-sm' : ''}>

            {/* Top Header - STICKY */}
            <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
              <div className="px-6 py-4 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{exam.name}</h2>
                  <p className="text-sm text-gray-500">
                    Question {currentIndex + 1} of {questions.length}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg font-mono text-base font-semibold">
                    ⏱ {formatTime()}
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-green-700 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Exam'}
                  </button>
                </div>
              </div>

              {/* Progress Bar - Inside Sticky Header */}
              <div className="w-full bg-gray-200 h-1">
                <div
                  className="bg-blue-600 h-1 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {error && (
              <div className="mx-6 mt-6 mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
                {error}
              </div>
            )}

            {/* MAIN CONTENT - FLEX 70/30 LAYOUT */}
            <div className="flex h-[calc(100vh-73px)] overflow-hidden">

              {/* LEFT SECTION - QUESTION AREA */}
              <div className="flex-1 overflow-y-auto bg-white">
                <div className="px-6 py-5">

                  {/* Question Card */}
                  <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">

                    {/* Question Header */}
                    <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-md font-semibold">
                          {currentIndex + 1}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-700">
                            Question {currentIndex + 1}
                          </p>
                          <p className="text-xs text-gray-500">
                            1 Mark
                          </p>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 font-medium">
                        {currentIndex + 1} / {questions.length}
                      </div>
                    </div>

                    {/* Question Text */}
                    <div className="px-6 py-6">
                      {!currentQuestion ? (
                        <p className="text-gray-600">No questions available.</p>
                      ) : (
                        <p className="text-xl font-medium text-gray-900 leading-relaxed">
                          {currentQuestion.questionText}
                        </p>
                      )}
                    </div>

                    {/* Options */}
                    {currentQuestion && (
                      <div className="px-6 pb-6 space-y-2">
                        {currentQuestion.options.map((option, index) => (
                          <label
                            key={index}
                            className={`flex items-start gap-3 border-2 p-4 rounded-md cursor-pointer transition-all duration-200 ${answers[currentQuestion._id] === index
                              ? "border-blue-600 bg-blue-50"
                              : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                              }`}
                          >
                            <input
                              type="radio"
                              name="option"
                              value={index}
                              checked={answers[currentQuestion._id] === index}
                              onChange={() => handleSelectOption(currentQuestion._id, index)}
                              className="mt-1 w-4 h-4 text-blue-600"
                            />
                            <span className={`flex-1 text-gray-800 ${answers[currentQuestion._id] === index ? 'font-medium text-blue-900' : ''
                              }`}>
                              {option}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="px-6 pb-6 flex justify-between items-center pt-4 border-t border-gray-200">
                      <button
                        disabled={isSubmitting || currentIndex === 0}
                        onClick={() => {
                          ensureFullscreen();
                          setCurrentIndex(prev => prev - 1);
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        Previous
                      </button>

                      <span className="text-sm text-gray-500">
                        {currentIndex + 1} / {questions.length}
                      </span>

                      <button
                        disabled={isSubmitting || currentIndex === questions.length - 1}
                        onClick={() => {
                          ensureFullscreen();
                          setCurrentIndex(prev => prev + 1);
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        Next
                      </button>
                    </div>

                  </div>

                </div>
              </div>

              {/* RIGHT SECTION - QUESTION NAVIGATOR PANEL */}
              <div className="w-80 bg-white border-l border-gray-300 shadow-sm flex flex-col overflow-hidden">

                {/* Navigator Header - Fixed */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h4 className="font-bold text-gray-900">Question Navigator</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {Object.values(questionStatus).filter(s => s?.answered).length} of {questions.length} answered
                  </p>
                </div>

                {/* Question Grid - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="grid grid-cols-5 gap-2">
                    {questions.map((q, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          ensureFullscreen();
                          setCurrentIndex(index);
                        }}
                        className={`w-10 h-10 rounded-md font-medium text-sm transition-all ${index === currentIndex
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : questionStatus[q._id]?.answered
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : questionStatus[q._id]?.visited
                              ? 'bg-red-400 text-white hover:bg-red-500'
                              : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                          } hover:scale-105`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Legend - Fixed Bottom */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 space-y-2.5">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-gray-700">Answered</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 bg-red-400 rounded"></div>
                    <span className="text-gray-700">Not Answered</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 bg-gray-300 rounded"></div>
                    <span className="text-gray-700">Not Visited</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 bg-blue-600 rounded"></div>
                    <span className="text-gray-700">Current</span>
                  </div>
                </div>

                {/* Warning Card */}
                <div className="m-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-xs text-orange-700">
                    ⚠️ Review all questions before submitting
                  </p>
                </div>

              </div>

            </div>

          </div> {/* End of blur container */}
        </div>
      )}
      {/* End of main exam UI */}

    </div>
  );
};

export default ExamAttempt;