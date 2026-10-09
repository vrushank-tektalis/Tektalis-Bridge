import React from 'react';
import { classNames } from '../../utils/helpers';

const Badge = ({ children, variant = 'gray', className = '' }) => {
  const variants = {
    success: 'bg-emerald-100 text-emerald-800',
    warning: 'bg-amber-100 text-amber-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    indigo: 'bg-indigo-100 text-indigo-800',
    gray: 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={classNames(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      variants[variant] || variants.gray,
      className
    )}>
      {children}
    </span>
  );
};

export default Badge;
