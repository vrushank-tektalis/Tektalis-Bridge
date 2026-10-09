import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useAuth } from './AuthContext';

export const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [sockets, setSockets] = useState({});

  const connect = useCallback((url, name) => {
    if (!isAuthenticated) return;
    const token = localStorage.getItem('accessToken');
    const ws = new WebSocket(`ws://${window.location.host}${url}?token=${token}`);
    
    setSockets(prev => ({ ...prev, [name]: ws }));

    ws.onclose = () => {
      setTimeout(() => connect(url, name), 3000);
    };

    return ws;
  }, [isAuthenticated]);

  const disconnect = useCallback((name) => {
    if (sockets[name]) {
      sockets[name].close();
      setSockets(prev => {
        const newSockets = { ...prev };
        delete newSockets[name];
        return newSockets;
      });
    }
  }, [sockets]);

  useEffect(() => {
    return () => {
      Object.values(sockets).forEach(ws => ws.close());
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ sockets, connect, disconnect }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
