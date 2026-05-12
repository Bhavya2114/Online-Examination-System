const ActionCard = ({ title, description, borderColor, icon }) => {
  return (
    <div
      className={`bg-white p-6 rounded-lg shadow-sm border-l-4 ${
        borderColor || 'border-blue-500'
      } hover:shadow-md transition-all duration-200 cursor-pointer hover:-translate-y-0.5`}
    >
      <h4 className="text-base font-semibold text-gray-900 flex items-center gap-2">
        <span className="text-lg">{icon}</span> {title}
      </h4>

      <p className="text-gray-600 mt-2 text-sm">
        {description}
      </p>
    </div>
  );
};

export default ActionCard;
