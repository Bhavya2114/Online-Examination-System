import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../api/axiosInstance';

const LiveActiveExams = () => {
  const navigate = useNavigate();
  const [limit, setLimit] = useState(5);
  const [exams, setExams] = useState([]);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchLiveExams(limit);
  }, [limit]);

  const fetchLiveExams = async (currentLimit) => {
    try {
      const response = await api.get(`/exams/live?limit=${currentLimit}`);
      setExams(response.data.exams || []);
      setHasMore(Boolean(response.data.hasMore));
    } catch (error) {
      console.error('Live exams fetch error:', error);
      toast.error(error.response?.data?.message || 'Failed to load live exams');
    }
  };

  const handleLoadMore = () => {
    setLimit((prev) => prev + 5);
  };

  const handleViewResults = (examId) => {
    navigate(`/admin/results/${examId}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Live Active Exams</h2>
            <p className="text-sm text-gray-600 mt-1">Exams currently being attempted by students</p>
          </div>
          {exams.length > 0 && (
            <button
              onClick={() => navigate('/admin/exams')}
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            >
              View All
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {exams.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Live Exams</h3>
            <p className="text-gray-600">There are no exams being attempted by students right now</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exams.map((exam) => (
                <div
                  key={exam._id}
                  className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow bg-white"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      ACTIVE
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-gray-900 mb-3 line-clamp-2">
                    {exam.name}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span className="capitalize">{exam.subject}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span className="font-medium">{exam.attemptCount}</span>
                      <span className="ml-1 text-gray-500">
                        {exam.attemptCount === 1 ? 'attempt' : 'attempts'}
                      </span>
                    </div>

                    {exam.latestAttemptAt && (
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Last: {new Date(exam.latestAttemptAt).toLocaleTimeString()}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleViewResults(exam._id)}
                    className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Results
                  </button>
                </div>
              ))}
            </div>

            {hasMore && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LiveActiveExams;
