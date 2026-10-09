import React from 'react';
import { classNames } from '../../utils/helpers';

const ProgressBar = ({ value, color = 'bg-indigo-600', showLabel = false, size = 'md' }) => {
  const sizes = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-xs font-medium text-gray-700">Progress</span>
          <span className="text-xs font-medium text-gray-700">{clampedValue}%</span>
        </div>
      )}
      <div className={classNames("w-full bg-gray-200 rounded-full overflow-hidden", sizes[size])}>
        <div
          className={classNames("h-full rounded-full transition-all duration-500 ease-in-out", color)}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
