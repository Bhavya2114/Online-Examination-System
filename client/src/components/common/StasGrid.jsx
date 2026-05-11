const StatsGrid = ({ stats }) => {
  const defaultStats = {
    activeExams: 0,
    completedExams: 0,
    averageScore: 0,
    totalHours: 0
  };

  const data = stats || defaultStats;

  return (
    <div className="grid grid-cols-4 gap-6 mt-6">

      {/* Card 1 - Active Exams */}
      <div className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-between">
        <div>
          <p className="text-2xl font-semibold text-gray-800">{data.activeExams}</p>
          <p className="text-sm text-gray-500">Active Exams</p>
        </div>
        <div className="w-12 h-12 rounded-lg bg-blue-500"></div>
      </div>

      {/* Card 2 - Completed */}
      <div className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-between">
        <div>
          <p className="text-2xl font-semibold text-gray-800">{data.completedExams}</p>
          <p className="text-sm text-gray-500">Completed</p>
        </div>
        <div className="w-12 h-12 rounded-lg bg-green-500"></div>
      </div>

      {/* Card 3 - Avg. Score */}
      <div className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-between">
        <div>
          <p className="text-2xl font-semibold text-gray-800">{parseFloat(data.averageScore).toFixed(1)}%</p>
          <p className="text-sm text-gray-500">Avg. Score</p>
        </div>
        <div className="w-12 h-12 rounded-lg bg-purple-500"></div>
      </div>

      {/* Card 4 - Hours Total */}
      <div className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-between">
        <div>
          <p className="text-2xl font-semibold text-gray-800">{parseFloat(data.totalHours).toFixed(1)}</p>
          <p className="text-sm text-gray-500">Hours Total</p>
        </div>
        <div className="w-12 h-12 rounded-lg bg-orange-500"></div>
      </div>

    </div>
  );
};

export default StatsGrid;
