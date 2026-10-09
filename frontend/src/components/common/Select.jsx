import React, { forwardRef } from 'react';
import { classNames } from '../../utils/helpers';

const Select = forwardRef(({
  label,
  id,
  name,
  options = [],
  error,
  className = '',
  required,
  ...props
}, ref) => {
  const selectId = id || name;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        ref={ref}
        name={name}
        id={selectId}
        className={classNames(
          "mt-1 block w-full pl-3 pr-10 py-2 text-base sm:text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-offset-0",
          error 
            ? "border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500" 
            : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500",
          "border shadow-sm bg-white"
        )}
        {...props}
      >
        <option value="" disabled>Select an option</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
