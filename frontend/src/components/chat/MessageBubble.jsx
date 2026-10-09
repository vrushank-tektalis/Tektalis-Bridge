import React from 'react';
import Avatar from '../common/Avatar';
import { formatDateTime } from '../../utils/helpers';
import { classNames } from '../../utils/helpers';

const MessageBubble = ({ message, isOwn, senderName }) => {
  return (
    <div className={classNames("flex w-full mt-2 space-x-3 max-w-lg", isOwn ? "ml-auto justify-end space-x-reverse" : "")}>
      {!isOwn && (
        <div className="flex-shrink-0">
          <Avatar name={senderName || 'User'} size="sm" />
        </div>
      )}
      <div>
        {!isOwn && (
          <div className="mb-1 text-xs text-gray-500 pl-1">{senderName}</div>
        )}
        <div 
          className={classNames(
            "p-3 rounded-2xl whitespace-pre-wrap break-words text-sm",
            isOwn 
              ? "bg-indigo-600 text-white rounded-br-none" 
              : "bg-white border border-gray-200 text-gray-900 rounded-bl-none shadow-sm"
          )}
        >
          {message.content}
        </div>
        <div className={classNames("mt-1 text-[10px] text-gray-400", isOwn ? "text-right pr-1" : "pl-1")}>
          {formatDateTime(message.created_at)}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
