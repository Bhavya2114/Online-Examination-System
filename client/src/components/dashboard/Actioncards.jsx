const ActionCard = ({ title, description, borderColor, icon }) => {
  return (
    <div
      className={`bg-white p-6 rounded-xl shadow 
                  hover:shadow-lg hover:-translate-y-1 
                  transition-all duration-200 
                  cursor-pointer border-l-4 ${borderColor}`}
    >
      <h4 className="text-lg font-bold text-gray-800">
        {icon} {title}
      </h4>

      <p className="text-gray-500 mt-2 text-sm">
        {description}
      </p>
    </div>
  );
};

export default ActionCard;
