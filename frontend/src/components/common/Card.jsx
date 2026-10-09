import React from 'react';
import { classNames } from '../../utils/helpers';

const Card = ({ children, title, subtitle, action, className = '', noPadding = false }) => {
  return (
    <div className={classNames('bg-white overflow-hidden shadow-sm rounded-xl border border-gray-200', className)}>
      {(title || subtitle || action) && (
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center bg-white">
          <div>
            {title && <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>}
            {subtitle && <p className="mt-1 max-w-2xl text-sm text-gray-500">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={classNames(!noPadding && 'px-4 py-5 sm:p-6')}>
        {children}
      </div>
    </div>
  );
};

export default Card;
