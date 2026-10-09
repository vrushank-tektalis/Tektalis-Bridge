import React from 'react';
import { getInitials, classNames } from '../../utils/helpers';

const Avatar = ({ name, size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
  };

  const colors = [
    'bg-red-100 text-red-700',
    'bg-orange-100 text-orange-700',
    'bg-amber-100 text-amber-700',
    'bg-green-100 text-green-700',
    'bg-emerald-100 text-emerald-700',
    'bg-teal-100 text-teal-700',
    'bg-cyan-100 text-cyan-700',
    'bg-blue-100 text-blue-700',
    'bg-indigo-100 text-indigo-700',
    'bg-violet-100 text-violet-700',
    'bg-purple-100 text-purple-700',
    'bg-fuchsia-100 text-fuchsia-700',
    'bg-pink-100 text-pink-700',
    'bg-rose-100 text-rose-700',
  ];

  const getColor = (name) => {
    if (!name) return colors[0];
    const hash = name.charCodeAt(0) % colors.length;
    return colors[hash];
  };

  return (
    <div className={classNames(
      "inline-flex items-center justify-center rounded-full font-bold uppercase",
      sizes[size],
      getColor(name),
      className
    )}>
      {getInitials(name)}
    </div>
  );
};

export default Avatar;
