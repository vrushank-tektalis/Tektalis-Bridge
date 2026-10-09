import React, { forwardRef } from 'react';
import { classNames } from '../../utils/helpers';

const Input = forwardRef(({
  label,
  id,
  name,
  type = 'text',
  error,
  className = '',
  icon: Icon,
  ...props
}, ref) => {
  const inputId = id || name;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative rounded-md shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          name={name}
          id={inputId}
          className={classNames(
            "block w-full rounded-md sm:text-sm focus:outline-none focus:ring-2 focus:ring-offset-0",
            Icon ? "pl-10" : "pl-3",
            error 
              ? "border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500" 
              : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500",
            "border py-2 px-3 shadow-sm"
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600" id={`${inputId}-error`}>
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
