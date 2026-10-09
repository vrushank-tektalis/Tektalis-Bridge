import React from 'react';
import Button from './Button';

const EmptyState = ({ icon: Icon, title, message, action }) => {
  return (
    <div className="text-center py-12 px-4 sm:px-6 lg:px-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
      {Icon && <Icon className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />}
      <h3 className="mt-2 text-sm font-semibold text-gray-900">{title}</h3>
      {message && <p className="mt-1 text-sm text-gray-500">{message}</p>}
      {action && (
        <div className="mt-6">
          <Button onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
