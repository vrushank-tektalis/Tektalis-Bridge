import React from 'react';
import { AlertCircle } from 'lucide-react';
import Button from './Button';

const ErrorState = ({ message = "Something went wrong.", onRetry }) => {
  return (
    <div className="rounded-md bg-red-50 p-4 border border-red-200 my-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">Error</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{message}</p>
          </div>
          {onRetry && (
            <div className="mt-4">
              <Button variant="danger" size="sm" onClick={onRetry}>
                Try again
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorState;
