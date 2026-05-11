const DashboardExamCard = ({ exam }) => {
  const isActive = exam.status === 'active';
  const createdDate = exam.createdAt
    ? new Date(exam.createdAt).toLocaleDateString()
    : 'N/A';
  const questionCount = Array.isArray(exam.questions) ? exam.questions.length : 0;

  return (
    <div className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-semibold text-lg text-gray-800 line-clamp-2">{exam.name}</h3>
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${isActive ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
            }`}
        >
          {isActive ? 'Active' : 'Completed'}
        </span>
      </div>

      <p className="text-gray-500 text-sm capitalize mb-4">{exam.subject}</p>

      <div className="space-y-2 text-sm text-gray-600">
        <p><span className="font-medium">Date:</span> {createdDate}</p>
        <p><span className="font-medium">Duration:</span> {exam.duration} minutes</p>
        <p><span className="font-medium">Questions:</span> {questionCount}</p>
      </div>
    </div>
  );
};

export default DashboardExamCard;
