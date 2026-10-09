import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

const SearchInput = ({ value, onChange, placeholder = "Search...", debounceMs = 300, className = '' }) => {
  const [localValue, setLocalValue] = useState(value || '');

  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [localValue, debounceMs, onChange, value]);

  return (
    <div className={`relative rounded-md shadow-sm ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
      </div>
      <input
        type="text"
        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border shadow-sm"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
      />
    </div>
  );
};

export default SearchInput;
