import { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import { toast } from 'react-hot-toast';
import ResultReviewModal from '../../components/student/ResultReviewModal';

const Results = () => {
  const [selectedResultId, setSelectedResultId] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyResults();
  }, []);

  const fetchMyResults = async () => {
    try {
      setLoading(true);
      const response = await api.get('/results/my-results');
      setResults(response.data?.results || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching my results:', err);
      setError(err.response?.data?.message || 'Failed to fetch results');
      toast.error('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>Loading results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">My Results</h1>
      <p className="text-gray-500 mb-6">Exams you have submitted</p>

      {results.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No exams submitted yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((result) => (
            <div
              key={result.resultId}
              className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-lg text-gray-800 line-clamp-2">
                  {result.examName}
                </h3>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${result.status === 'Passed'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}
                >
                  {result.status}
                </span>
              </div>

              <p className="text-gray-500 text-sm capitalize mb-4">
                {result.subject}
              </p>

              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Duration:</span> {result.duration} minutes
                </p>
                <p>
                  <span className="font-medium">Total Marks:</span> {result.totalMarks}
                </p>
                <p>
                  <span className="font-medium">Score:</span> {result.score} / {result.totalMarks}
                </p>
                <p>
                  <span className="font-medium">Percentage:</span> {result.percentage}%
                </p>
                <p>
                  <span className="font-medium">Submitted Date:</span>{' '}
                  {new Date(result.submittedAt).toLocaleDateString()}
                </p>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setSelectedResultId(result.resultId)}
                  className="mt-6 w-full py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm shadow-md transition-all duration-300 ease-out hover:bg-blue-700 hover:scale-[1.08] hover:-translate-y-1 hover:shadow-2xl hover:brightness-110 active:scale-[0.97]"
                >
                  View Result
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedResultId && (
        <ResultReviewModal
          resultId={selectedResultId}
          onClose={() => setSelectedResultId(null)}
        />
      )}
    </div>
  );
};

export default Results;
