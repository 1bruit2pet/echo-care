import React from 'react';
import clsx from 'clsx';

const KPICard = ({ label, value, icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-600 shadow-blue-200',
    purple: 'bg-purple-600 shadow-purple-200',
    emerald: 'bg-emerald-600 shadow-emerald-200',
    rose: 'bg-rose-600 shadow-rose-200',
  };

  return (
    <div className={clsx(
      "p-5 rounded-[2.5rem] text-white shadow-xl flex flex-col justify-between h-36",
      colorClasses[color]
    )}>
      <div className="flex justify-between items-start">
        <h3 className="text-sm font-bold uppercase opacity-80">{label}</h3>
        {icon && React.cloneElement(icon, { size: 24, className: 'opacity-80' })}
      </div>
      <p className="text-4xl font-black">{value}</p>
    </div>
  );
};

export default KPICard;