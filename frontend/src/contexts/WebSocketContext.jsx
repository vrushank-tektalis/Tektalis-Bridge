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
    let destroyed = false;
    
    setSockets(prev => ({ ...prev, [name]: ws }));

    ws.onclose = () => {
      if (!destroyed) {
        setTimeout(() => connect(url, name), 3000);
      }
    };

    // Store destroy function alongside socket so disconnect can set the flag
    ws._destroy = () => { destroyed = true; };

    return ws;
  }, [isAuthenticated]);

  const disconnect = useCallback((name) => {
    if (sockets[name]) {
      sockets[name]._destroy?.();
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
      Object.values(sockets).forEach(ws => {
        ws._destroy?.();
        ws.close();
      });
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ sockets, connect, disconnect }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
