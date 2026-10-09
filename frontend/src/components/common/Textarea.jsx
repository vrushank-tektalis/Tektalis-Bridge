import React, { forwardRef } from 'react';
import { classNames } from '../../utils/helpers';

const Textarea = forwardRef(({
  label,
  id,
  name,
  rows = 4,
  error,
  className = '',
  required,
  ...props
}, ref) => {
  const textareaId = id || name;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="mt-1 relative rounded-md shadow-sm">
        <textarea
          ref={ref}
          name={name}
          id={textareaId}
          rows={rows}
          className={classNames(
            "block w-full rounded-md sm:text-sm focus:outline-none focus:ring-2 focus:ring-offset-0",
            error 
              ? "border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500" 
              : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500",
            "border py-2 px-3 shadow-sm"
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';
export default Textarea;
