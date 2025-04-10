import { useEffect, useRef, useCallback } from 'react';

type UpdateCallback = (update: { securityId: string; price: string; timestamp: string }) => void;

export function useWebSocket(onUpdate: UpdateCallback, interval?: string) {
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const ws = new WebSocket('ws://localhost:8080');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      // Send initial interval value if provided
      if (interval) {
        ws.send(JSON.stringify({ interval }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const update = JSON.parse(event.data);
        onUpdate(update);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      // Attempt to reconnect after a delay
      setTimeout(connect, 1000);
    };
  }, [onUpdate, interval]);

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  // Send new interval value when it changes
  useEffect(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN && interval) {
      wsRef.current.send(JSON.stringify({ interval }));
    }
  }, [interval]);

  return {
    reconnect: connect,
  };
} 