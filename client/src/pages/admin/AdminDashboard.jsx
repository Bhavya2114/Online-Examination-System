import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Activity,
  Users,
  CheckCircle
} from 'lucide-react';

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
  const [animateProgress, setAnimateProgress] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!dashboardExams.length) {
      setAnimateProgress(false);
      return;
    }

    setAnimateProgress(false);

    const frame = requestAnimationFrame(() => {
      setAnimateProgress(true);
    });

    return () => cancelAnimationFrame(frame);
  }, [dashboardExams]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [statsResponse, dashboardSummaryResponse] = await Promise.all([
        api.get('/admin/dashboard-stats'),
        api.get('/exams/dashboard-summary')
      ]);

      setStats(statsResponse.data);

      setDashboardExams(
        dashboardSummaryResponse.data.exams || []
      );
    } catch (error) {
      console.error('Dashboard fetch error:', error);

      toast.error(
        error.response?.data?.message ||
        'Failed to load dashboard'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  const getQuestionCount = (exam) => {
    if (typeof exam.totalQuestions === 'number') {
      return exam.totalQuestions;
    }

    if (Array.isArray(exam.questions)) {
      return exam.questions.length;
    }

    return 0;
  };

  const getAttemptCount = (exam) => {
    if (typeof exam.attemptCount === 'number') {
      return exam.attemptCount;
    }

    return 0;
  };

  const getExamProgress = (exam) => {
    const durationMinutes = Number(exam.duration) || 0;

    const status = String(
      exam.status || 'draft'
    ).toLowerCase();

    if (status === 'completed') {
      return {
        progress: 100,
        elapsedText: `${durationMinutes}m / ${durationMinutes}m`,
        percentText: '100% elapsed'
      };
    }

    if (status === 'draft' || !durationMinutes) {
      return {
        progress: 0,
        elapsedText: `0m / ${durationMinutes}m`,
        percentText: '0% elapsed'
      };
    }

    const startTime = exam.startTime
      ? new Date(exam.startTime)
      : null;

    const now = new Date();

    if (!startTime || Number.isNaN(startTime.getTime())) {
      return {
        progress: 0,
        elapsedText: `0m / ${durationMinutes}m`,
        percentText: '0% elapsed'
      };
    }

    const elapsedMinutes = Math.max(
      0,
      Math.min(
        durationMinutes,
        (now.getTime() - startTime.getTime()) / 60000
      )
    );

    const progress = Math.max(
      0,
      Math.min(
        100,
        (elapsedMinutes / durationMinutes) * 100
      )
    );

    return {
      progress,
      elapsedText: `${Math.round(elapsedMinutes)}m / ${durationMinutes}m`,
      percentText: `${Math.round(progress)}% elapsed`
    };
  };

  const getStatusMeta = (exam) => {
    const status = String(
      exam.status || 'draft'
    ).toLowerCase();

    if (status === 'active') {
      return {
        label: 'Active',
        className: 'bg-emerald-100 text-emerald-700'
      };
    }

    if (status === 'completed') {
      return {
        label: 'Completed',
        className: 'bg-violet-100 text-violet-700'
      };
    }

    return {
      label: 'Draft',
      className: 'bg-slate-200 text-slate-700'
    };
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">

<div className="hidden">
</div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-4 shrink-0">

        {/* Card 1 */}
        <div className="bg-white rounded-3xl p-4 shadow-[0_10px_40px_rgba(15,23,42,0.04)] border border-slate-200/60 relative overflow-hidden hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)] transition-all duration-300">

          <div className="absolute top-0 left-0 w-full h-1 bg-blue-500" />

          <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center p-4">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>

          <p className="text-sm font-medium text-slate-500">
            Total Exams
          </p>

          <p className="text-[42px] font-semibold tracking-tight text-slate-900 mt-3">
            {stats.totalExams}
          </p>

        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-3xl p-4 shadow-[0_10px_40px_rgba(15,23,42,0.04)] border border-slate-200/60 relative overflow-hidden hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)] transition-all duration-300">

          <div className="absolute top-0 left-0 w-full h-1 bg-green-500" />

          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center p-4">
            <Activity className="w-6 h-6 text-emerald-600" />
          </div>

          <p className="text-sm font-medium text-slate-500">
            Active Exams
          </p>

          <p className="text-[42px] font-semibold tracking-tight text-slate-900 mt-3">
            {stats.activeExams}
          </p>

        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-3xl p-4 shadow-[0_10px_40px_rgba(15,23,42,0.04)] border border-slate-200/60 relative overflow-hidden hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)] transition-all duration-300">

          <div className="absolute top-0 left-0 w-full h-1 bg-orange-500" />

          <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center p-4">
            <Users className="w-6 h-6 text-orange-600" />
          </div>

          <p className="text-sm font-medium text-slate-500">
            Students Attempted Today
          </p>

          <p className="text-[42px] font-semibold tracking-tight text-slate-900 mt-3">
            {stats.studentsAttemptedToday}
          </p>

        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-3xl p-4 shadow-[0_10px_40px_rgba(15,23,42,0.04)] border border-slate-200/60 relative overflow-hidden hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)] transition-all duration-300">

          <div className="absolute top-0 left-0 w-full h-1 bg-violet-500" />

          <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center p-4">
            <CheckCircle className="w-6 h-6 text-violet-600" />
          </div>

          <p className="text-sm font-medium text-slate-500">
            Completed Exams
          </p>

          <p className="text-[42px] font-semibold tracking-tight text-slate-900 mt-3">
            {stats.completedExams}
          </p>

        </div>

      </div>

      {/* Table Card */}
      <div className="flex-1 min-h-0 mt-1 bg-white rounded-[30px] border border-slate-200/70 shadow-[0_10px_40px_rgba(15,23,42,0.04)] overflow-hidden flex flex-col max-h-[520px]">

        {/* Header */}
        <div className="px-8 py-4 border-b border-slate-200/70 shrink-0">

          <h2 className="text-[26px] font-semibold tracking-tight text-slate-900">
            Recent Active & Completed Exams
          </h2>

        </div>

        {/* Table Area */}
        <div className="flex-1 min-h-0 px-6 pb-4 overflow-hidden flex flex-col">

          {dashboardExams.length === 0 ? (

            <div className="flex flex-col items-center justify-center py-24 text-center">

              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-5">
                <BookOpen className="w-8 h-8 text-slate-400" />
              </div>

              <h3 className="text-lg font-semibold text-slate-800">
                No Exams Available
              </h3>

              <p className="text-sm text-slate-500 mt-2 max-w-sm">
                Active and completed exams will appear here once created.
              </p>

            </div>

          ) : (

            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden dashboard-scrollbar pr-2 pb-2">

              <table className="w-full border-separate border-spacing-y-1">

                {/* Table Head */}
                <thead className="sticky top-0 z-20 bg-white">

                  <tr>

                    {[
                      'Exam Name',
                      'Subject',
                      'Students',
                      'Status',
                      'Progress',
                      'Date',
                      'Actions'
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="sticky top-0 z-20 bg-white text-left px-4 py-4 text-xs font-semibold tracking-[0.14em] uppercase text-slate-400 border-b border-slate-200/80"
                      >
                        {heading}
                      </th>
                    ))}

                  </tr>

                </thead>

                {/* Table Body */}
                <tbody>

                  {dashboardExams.map((exam) => {

                    const questionCount = getQuestionCount(exam);

                    const attemptCount = getAttemptCount(exam);

                    const progressInfo = getExamProgress(exam);

                    const statusMeta = getStatusMeta(exam);

                    const createdDate = exam.createdAt
                      ? new Date(exam.createdAt).toLocaleDateString()
                      : '—';

                    return (

                      <tr
                        key={exam._id}
                        className="
                          bg-white
                          hover:bg-violet-50/40
                          transition-all
                          duration-200
                          hover:scale-[0.998]
                        "
                      >

                        {/* Exam Name */}
                        <td className="px-4 py-5 border-b border-slate-100">

                          <div>

                            <p className="text-[15px] font-semibold text-slate-900">
                              {exam.name}
                            </p>

                            <p className="text-sm text-slate-500 mt-1">
                              {questionCount} Questions
                            </p>

                          </div>

                        </td>

                        {/* Subject */}
                        <td className="px-4 py-5 text-sm text-slate-600 capitalize border-b border-slate-100">
                          {exam.subject}
                        </td>

                        {/* Students */}
                        <td className="px-4 py-5 text-sm text-slate-600 border-b border-slate-100">
                          {attemptCount} attempted
                        </td>

                        {/* Status */}
                        <td className="px-4 py-5 border-b border-slate-100">

                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusMeta.className}`}>
                            {statusMeta.label}
                          </span>

                        </td>

                        {/* Progress */}
                        <td className="px-4 py-5 border-b border-slate-100">

                          <div className="space-y-2">

                            <div className="flex items-center justify-between gap-3">

                              <span className="text-sm font-medium text-slate-700">
                                {progressInfo.elapsedText}
                              </span>

                              <span className="text-xs text-slate-500">
                                {progressInfo.percentText}
                              </span>

                            </div>

                            <div className="h-2.5 w-full rounded-full bg-slate-200/80 overflow-hidden">

                              <div
                                className="h-full rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.35)] transition-[width] duration-700 ease-out"
                                style={{
                                  width: animateProgress
                                    ? `${progressInfo.progress}%`
                                    : '0%'
                                }}
                              />

                            </div>

                          </div>

                        </td>

                        {/* Date */}
                        <td className="px-4 py-5 text-sm text-slate-600 border-b border-slate-100">
                          {createdDate}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-5 border-b border-slate-100">

                          <button
                            className="text-[#5c51e8] hover:text-[#4f46e5] text-sm font-semibold transition-colors"
                            onClick={() => navigate(`/admin/exam/${exam._id}`)}
                          >
                            View
                          </button>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;