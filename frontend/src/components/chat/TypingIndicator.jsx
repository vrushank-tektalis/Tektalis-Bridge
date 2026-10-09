import React from 'react';

const TypingIndicator = ({ typingUsers = [] }) => {
  if (typingUsers.length === 0) return <div className="h-5"></div>;

  const text = typingUsers.length === 1 
    ? `${typingUsers[0]} is typing` 
    : typingUsers.length === 2 
      ? `${typingUsers[0]} and ${typingUsers[1]} are typing`
      : 'Several people are typing';

  return (
    <div className="h-5 flex items-center text-xs text-gray-500 gap-1.5">
      <span>{text}</span>
      <div className="flex gap-0.5 items-center pb-1">
        <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
        <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
        <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
      </div>
    </div>
  );
};

export default TypingIndicator;
