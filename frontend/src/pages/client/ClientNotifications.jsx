import React from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Bell, Check, CheckCheck, Clock } from 'lucide-react';

const ClientNotifications = () => {
  const { notifications, loading, markRead, markAllRead } = useNotifications();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500">Stay updated with your projects, team requests, and milestones</p>
        </div>
        {notifications.some((n) => !n.is_read) && (
          <Button variant="secondary" size="sm" onClick={markAllRead}>
            <CheckCheck className="w-4 h-4 mr-1.5" />
            Mark all as read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          message="You're all caught up! New project updates and messages will appear here."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => (
            <Card
              key={item.id || item.notification_id}
              className={`transition-colors ${item.is_read ? 'bg-white opacity-80' : 'bg-indigo-50/40 border-indigo-100'}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${item.is_read ? 'bg-gray-100 text-gray-500' : 'bg-indigo-100 text-indigo-600'}`}>
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">{item.title}</h4>
                    <p className="text-sm text-gray-600 mt-0.5">{item.message}</p>
                    <span className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
                {!item.is_read && (
                  <Button variant="ghost" size="sm" onClick={() => markRead(item.id || item.notification_id)}>
                    <Check className="w-4 h-4 mr-1" />
                    Read
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientNotifications;
