import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosInstance';
import Loader from '../../components/common/Loader';
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalExams: 0,
    activeExams: 0,
    completedExams: 0,
    studentsAttemptedToday: 0
  });
  const [dashboardExams, setDashboardExams] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [statsResponse, dashboardSummaryResponse] = await Promise.all([
        api.get('/admin/dashboard-stats'),
        api.get('/exams/dashboard-summary')
      ]);

      setStats(statsResponse.data);
      setDashboardExams(dashboardSummaryResponse.data.exams || []);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      toast.error(error.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Monitor and manage examination system
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

          {/* Total Exams */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <p className="text-sm font-medium text-gray-600">Total Exams</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stats.totalExams}
            </p>
          </div>

          {/* Active Exams */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <p className="text-sm font-medium text-gray-600">Active Exams</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {stats.activeExams}
            </p>
          </div>

          {/* Students Attempted Today */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <p className="text-sm font-medium text-gray-600">
              Students Attempted Today
            </p>
            <p className="text-3xl font-bold text-orange-600 mt-2">
              {stats.studentsAttemptedToday}
            </p>
          </div>

          {/* Completed Exams */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <p className="text-sm font-medium text-gray-600">
              Completed Exams
            </p>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {stats.completedExams}
            </p>
          </div>
        </div>

        {/* Exams Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Recent Active & Completed Exams
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Top 5 exams sorted by latest created
            </p>
          </div>

          <div className="p-6 space-y-6">
            {dashboardExams.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">
                  No active or completed exams available.
                </p>
              </div>
            ) : (
              dashboardExams.map((exam) => (
                <div
                  key={exam._id}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 hover:shadow-md transition"
                >
                  {/* Top Row */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {exam.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {exam.subject}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        exam.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {exam.status === 'active'
                        ? 'Active'
                        : 'Completed'}
                    </span>
                  </div>

                  {/* Middle Section */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6 text-sm text-gray-700">
                    <div>
                      <p className="text-gray-500">Date</p>
                      <p className="font-medium">
                        {new Date(exam.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">Duration</p>
                      <p className="font-medium">
                        {exam.duration} min
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">Questions</p>
                      <p className="font-medium">
                        {exam.totalQuestions ||
                          exam.questions?.length ||
                          0}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Section */}
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                      {exam.status === 'completed'
                        ? 'Exam completed'
                        : 'Exam currently active'}
                    </p>

                    <div className="flex items-center gap-3">
                      {/* View Button */}
                      <button
                        className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                        onClick={() =>
                          navigate(`/admin/exam/${exam._id}`)
                        }
                      >
                        View
                      </button>

                      {/* Edit Button (Only if Active) */}
                      {exam.status === 'active' && (
                        <button
                          className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                          onClick={() =>
                            navigate(`/admin/exam/edit/${exam._id}`)
                          }
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;