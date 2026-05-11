import { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import { toast } from 'react-hot-toast';

const ResultReviewModal = ({ resultId, onClose }) => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  useEffect(() => {
    fetchResultDetails();
  }, [resultId]);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const fetchResultDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/results/${resultId}`);
      if (response.data?.success) {
        setResult(response.data.data);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching result details:', err);
      setError(err.response?.data?.message || 'Failed to load result details');
      toast.error('Failed to load result details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <p className="text-gray-600">Loading result review...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md">
          <p className="text-red-600">{error || 'Failed to load result'}</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const { examName, score, totalMarks, percentage, status, timeTaken, totalQuestions, attemptedQuestions, unattemptedQuestions, correctAnswers, wrongAnswers, submittedAt, questions } = result;

  const formatTime = (seconds) => {
    if (seconds === undefined || seconds === null) {
      return "00:00";
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const formattedMins = String(mins).padStart(2, "0");
    const formattedSecs = String(secs).padStart(2, "0");
    return `${formattedMins}:${formattedSecs}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-300">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Result Review</h1>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl font-semibold"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* SECTION 1 — Summary Card */}
          <div className="bg-linear-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">{examName}</h2>
              <span
                className={`px-4 py-1 rounded-full font-semibold text-sm ${status === 'Passed'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
                  }`}
              >
                {status}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white rounded-lg p-3">
                <p className="text-gray-600">Score</p>
                <p className="text-lg font-semibold text-gray-900">{score} / {totalMarks}</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-gray-600">Percentage</p>
                <p className="text-lg font-semibold text-gray-900">{percentage}%</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-gray-600">Time Taken</p>
                <p className="text-lg font-semibold text-gray-900">{formatTime(timeTaken)}</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-gray-600">Attempted</p>
                <p className="text-lg font-semibold text-gray-900">{attemptedQuestions}/{totalQuestions}</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-green-700">Correct</p>
                <p className="text-lg font-semibold text-green-600">{correctAnswers}</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-red-700">Wrong</p>
                <p className="text-lg font-semibold text-red-600">{wrongAnswers}</p>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              Submitted: {new Date(submittedAt).toLocaleString()}
            </p>
          </div>

          {/* SECTION 2 — Question Review */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Question Review</h3>
            <div className="space-y-3">
              {questions.map((question, index) => {
                const isExpanded = expandedQuestion === index;
                const status = question.status; // 'correct', 'incorrect', or 'unattempted'
                const isAttempted = status !== 'unattempted';
                const isCorrect = status === 'correct';

                // Determine styling based on status
                let bgClass = 'bg-gray-50 border border-gray-200 hover:border-gray-300';
                let badgeClass = 'bg-gray-100 text-gray-700';
                let badgeIcon = '—';

                if (isCorrect) {
                  bgClass = 'bg-gray-50 border border-gray-200 hover:border-green-300';
                  badgeClass = 'bg-green-100 text-green-700';
                  badgeIcon = '✓';
                } else if (status === 'incorrect') {
                  bgClass = 'bg-red-50 border border-red-200 hover:border-red-400';
                  badgeClass = 'bg-red-100 text-red-700';
                  badgeIcon = '✕';
                }

                return (
                  <div
                    key={index}
                    className={`rounded-lg p-4 cursor-pointer transition ${bgClass}`}
                    onClick={() => setExpandedQuestion(isExpanded ? null : index)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-semibold text-sm ${badgeClass}`}
                      >
                        {badgeIcon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 wrap-break-word">
                          Q{index + 1}. {question.questionText}
                        </p>
                        {!isExpanded && (
                          <p className="text-xs text-gray-500 mt-1">
                            {status === 'correct' && 'Correct'}
                            {status === 'incorrect' && 'Incorrect'}
                            {status === 'unattempted' && 'Not Attempted'}
                            {' • Click to review'}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-gray-300 space-y-3">
                        {/* Options */}
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Options:</p>
                          <div className="space-y-1.5">
                            {question.options.map((option, optIndex) => {
                              const isSelected = optIndex === question.selectedOptionIndex;
                              const isCorrectOpt = optIndex === question.correctOptionIndex;

                              let bgClass = 'bg-white border border-gray-200';
                              let textClass = 'text-gray-700';

                              // Always highlight correct option in green
                              if (isCorrectOpt) {
                                bgClass = 'bg-green-50 border border-green-300';
                                textClass = 'text-green-800';
                              }
                              // Only highlight selected option in red if it's incorrect and not the correct option
                              else if (isSelected && status === 'incorrect') {
                                bgClass = 'bg-red-50 border border-red-300';
                                textClass = 'text-red-800';
                              }

                              return (
                                <div key={optIndex} className={`rounded-md p-2.5 text-sm ${bgClass} ${textClass}`}>
                                  <span className="font-medium">({String.fromCharCode(65 + optIndex)})</span> {option}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Answer Summary */}
                        <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1.5">
                          <p>
                            <span className="font-medium text-gray-700">Your Answer:</span>{' '}
                            <span className="text-gray-800">
                              {status === 'unattempted'
                                ? 'Not Attempted'
                                : question.selectedOptionIndex !== null && question.selectedOptionIndex !== undefined
                                  ? `(${String.fromCharCode(65 + question.selectedOptionIndex)}) ${question.options[question.selectedOptionIndex]}`
                                  : 'Not answered'}
                            </span>
                          </p>
                          <p>
                            <span className="font-medium text-gray-700">Correct Answer:</span>{' '}
                            <span className="text-green-700 font-medium">
                              ({String.fromCharCode(65 + question.correctOptionIndex)}) {question.options[question.correctOptionIndex]}
                            </span>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ResultReviewModal;
