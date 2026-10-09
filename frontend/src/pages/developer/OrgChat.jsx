import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ChatRoom from '../../components/chat/ChatRoom';
import Card from '../../components/common/Card';
import { MessageSquare, Users, Shield } from 'lucide-react';

const OrgChat = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-indigo-600" />
            Organization Developer Chat
          </h1>
          <p className="text-sm text-gray-500">
            Company-wide engineering channel for technical discussion, architectural decisions, and knowledge sharing.
          </p>
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-200 text-indigo-900 px-4 py-3 rounded-lg text-xs flex items-center justify-between">
        <span className="flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-600" />
          Channel visible to all registered developers and system administrators.
        </span>
        <span className="flex items-center gap-1 font-semibold text-indigo-700">
          <Shield className="w-3.5 h-3.5" />
          Moderated
        </span>
      </div>

      <ChatRoom
        roomId="org-chat-main"
        currentUser={user || { id: 'dev-user', full_name: 'Developer' }}
      />
    </div>
  );
};

export default OrgChat;
