import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axiosInstance';
import Timer from '../../components/exam/Timer';
import Loader from '../../components/common/Loader';
import { toast } from 'react-hot-toast';

const TakeExam = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    startExam();
  }, [examId]);

  const startExam = async () => {
    try {
      setLoading(true);
      const response = await api.post(`/exams/${examId}/start`);
      setExam(response.data);

      // Initialize answers object
      const initialAnswers = {};
      response.data.questions.forEach((q) => {
        initialAnswers[q._id] = null;
      });
      setAnswers(initialAnswers);

    } catch (error) {
      console.error('Start exam error:', error);
      toast.error(error.response?.data?.message || 'Failed to start exam');
      navigate('/student/exams');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleSubmit = async () => {
    // Confirm submission
    const unanswered = Object.values(answers).filter(a => a === null).length;

    if (unanswered > 0) {
      const confirm = window.confirm(
        `You have ${unanswered} unanswered question(s). Submit anyway?`
      );
      if (!confirm) return;
    }

    try {
      setSubmitting(true);

      // Format answers for backend
      const formattedAnswers = Object.entries(answers).map(([questionId, selectedOptionIndex]) => ({
        questionId,
        selectedOptionIndex
      }));

      await api.post(`/exams/${examId}/submit`, {
        answers: formattedAnswers
      });

      toast.success('Exam submitted successfully!');
      navigate('/student/results');

    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit exam');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTimeUp = () => {
    toast.error('Time is up! Auto-submitting exam...');
    handleSubmit();
  };

  if (loading) {
    return <Loader />;
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Exam not found</h2>
          <button
            onClick={() => navigate('/student/exams')}
            className="text-blue-600 hover:text-blue-700"
          >
            Go back to exams
          </button>
        </div>
      </div>
    );
  }

  const answeredCount = Object.values(answers).filter(a => a !== null).length;
  const totalQuestions = exam.questions.length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{exam.name}</h1>
              <p className="text-sm text-gray-600 mt-1">
                {answeredCount} of {totalQuestions} answered
              </p>
            </div>

            {/* Timer */}
            <Timer expiresAt={exam.expiresAt} onTimeUp={handleTimeUp} />
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {exam.questions.map((question, index) => {
            const isAnswered = answers[question._id] !== null;

            return (
              <div
                key={question._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                {/* Question Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="shrink-0 w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-semibold text-sm">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-lg text-gray-900 font-medium leading-relaxed">
                        {question.questionText}
                      </p>
                    </div>
                  </div>

                  {isAnswered && (
                    <span className="ml-4 px-2.5 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      Answered
                    </span>
                  )}
                </div>

                {/* Options */}
                <div className="ml-11 space-y-3">
                  {question.options.map((option, optionIndex) => {
                    const isSelected = answers[question._id] === optionIndex;

                    return (
                      <label
                        key={optionIndex}
                        className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                          }`}
                      >
                        <input
                          type="radio"
                          name={`question-${question._id}`}
                          checked={isSelected}
                          onChange={() => handleAnswerChange(question._id, optionIndex)}
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className={`ml-3 text-sm ${isSelected ? 'font-medium text-blue-900' : 'text-gray-700'}`}>
                          {option}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {submitting ? 'Submitting...' : 'Submit Exam'}
          </button>
        </div>
      </div>

      {/* Progress Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-5xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Progress: <span className="font-semibold text-gray-900">{answeredCount}/{totalQuestions}</span>
            </div>
            <div className="w-64 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeExam;
