import React, { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../../api/chat';
import { useWebSocket } from '../../hooks/useWebSocket';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import { Users, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ChatRoom = ({ roomId, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await chatAPI.getMessages(roomId, { limit: 50 });
        setMessages(res.data.reverse());
      } catch (error) {
        toast.error('Failed to load chat history');
      } finally {
        setIsLoading(false);
        scrollToBottom();
      }
    };
    if (roomId) fetchHistory();
  }, [roomId]);

  const token = localStorage.getItem('accessToken');
  const wsUrl = roomId ? `ws://${window.location.host}/ws/chat/${roomId}?token=${token}` : null;

  const { send, isConnected } = useWebSocket(wsUrl, {
    onMessage: (msg) => {
      if (msg.type === 'message') {
        setMessages(prev => [...prev, msg.data]);
        scrollToBottom();
      } else if (msg.type === 'typing') {
        if (msg.user_id !== currentUser.id) {
          setTypingUsers(prev => {
            if (!prev.includes(msg.user_name)) return [...prev, msg.user_name];
            return prev;
          });
          setTimeout(() => {
            setTypingUsers(prev => prev.filter(n => n !== msg.user_name));
          }, 3000);
        }
      } else if (msg.type === 'presence') {
        if (msg.status === 'online') {
          setOnlineUsers(prev => [...new Set([...prev, msg.user_name])]);
        } else {
          setOnlineUsers(prev => prev.filter(u => u !== msg.user_name));
        }
      }
    }
  });

  const handleSend = async (content) => {
    try {
      await chatAPI.sendMessage(roomId, { content });
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleTyping = () => {
    if (isConnected) {
      send({ type: 'typing' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm font-medium text-gray-700">Live Chat</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500" title={onlineUsers.join(', ')}>
          <Users className="h-4 w-4" />
          <span>{Math.max(1, onlineUsers.length)} online</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {messages.map((msg, idx) => (
          <MessageBubble 
            key={msg.id || idx}
            message={msg}
            isOwn={msg.sender_id === currentUser.id}
            senderName={msg.sender_name}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="px-4 py-2 bg-white">
        <TypingIndicator typingUsers={typingUsers} />
      </div>
      
      <div className="px-4 py-3 border-t border-gray-200 bg-white">
        <MessageInput onSend={handleSend} onTyping={handleTyping} disabled={!isConnected} />
      </div>
    </div>
  );
};

export default ChatRoom;
