import { useState, useEffect, useRef, useCallback } from 'react';

export const useWebSocket = (url, { onMessage, onOpen, onClose } = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimeout = useRef(null);

  const connect = useCallback(() => {
    if (!url) return;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      onOpen?.();
    };
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage?.(data);
      } catch (e) {
        onMessage?.(event.data);
      }
    };
    ws.onclose = () => {
      setIsConnected(false);
      onClose?.();
      reconnectTimeout.current = setTimeout(connect, 3000);
    };
    ws.onerror = (err) => {
      ws.close();
    };
  }, [url, onMessage, onOpen, onClose]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimeout.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const send = useCallback((data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(typeof data === 'string' ? data : JSON.stringify(data));
    }
  }, []);

  return { isConnected, send };
};
