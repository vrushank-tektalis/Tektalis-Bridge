import React, { useState, useRef } from 'react';
import { Send } from 'lucide-react';
import Button from '../common/Button';

const MessageInput = ({ onSend, onTyping, disabled }) => {
  const [content, setContent] = useState('');
  const textareaRef = useRef(null);

  const handleChange = (e) => {
    setContent(e.target.value);
    onTyping();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!content.trim() || disabled) return;
    onSend(content.trim());
    setContent('');
    textareaRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 items-end">
      <div className="flex-1 relative rounded-lg border border-gray-300 shadow-sm focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Type a message..."
          className="block w-full resize-none border-0 bg-transparent py-3 px-4 text-sm placeholder:text-gray-400 focus:ring-0 max-h-32"
          rows={Math.min(4, Math.max(1, content.split('\n').length))}
        />
      </div>
      <Button 
        type="submit" 
        disabled={!content.trim() || disabled}
        className="flex-shrink-0 h-11 px-4 rounded-lg"
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
};

export default MessageInput;
