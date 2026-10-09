import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, BellRing } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

const NotificationDropdown = ({ notifications, unreadCount, onMarkRead, onMarkAllRead, viewAllLink }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full hover:bg-gray-100"
      >
        <span className="sr-only">View notifications</span>
        <Bell className="h-6 w-6" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); onMarkAllRead(); }}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
              >
                Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-500">
                <BellRing className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                No notifications right now
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.slice(0, 10).map((notif) => (
                  <div
                    key={notif.notification_id || notif.id}
                    onClick={() => {
                      if (!notif.is_read) onMarkRead(notif.notification_id || notif.id);
                    }}
                    className={`block px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${!notif.is_read ? 'bg-indigo-50/50' : ''}`}
                  >
                    <div className="flex gap-3 items-start">
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!notif.is_read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                          {notif.title}
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                          {notif.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {notif.created_at ? formatDistanceToNow(new Date(notif.created_at), { addSuffix: true }) : 'Just now'}
                        </p>
                      </div>
                      {!notif.is_read && (
                        <div className="flex-shrink-0">
                          <span className="inline-block h-2 w-2 rounded-full bg-indigo-600"></span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <Link
            to={viewAllLink}
            onClick={() => setIsOpen(false)}
            className="block border-t border-gray-100 px-4 py-2 text-center text-sm font-medium text-indigo-600 hover:text-indigo-500 hover:bg-gray-50 rounded-b-md"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
