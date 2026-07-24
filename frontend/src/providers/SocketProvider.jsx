'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';

const SocketContext = createContext({
  socket: null,
  isConnected: false,
  connectionStatus: 'disconnected',
  activeStore: '',
  setActiveStore: () => {},
  toastNotifications: [],
  removeToast: () => {},
});

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // connecting, connected, reconnecting, disconnected
  const [activeStore, setActiveStoreState] = useState('');
  const [toastNotifications, setToastNotifications] = useState([]);
  const queryClient = useQueryClient();

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    setToastNotifications((prev) => [...prev, { ...toast, id }]);

    setTimeout(() => {
      setToastNotifications((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id) => {
    setToastNotifications((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socketInstance.on('connect', () => {
      console.log('[Socket] Connected to server:', socketInstance.id);
      setConnectionStatus('connected');

      // Re-join active store room if set
      if (activeStore) {
        socketInstance.emit('join:store', activeStore);
      }
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
      setConnectionStatus('disconnected');
    });

    socketInstance.io.on('reconnect_attempt', () => {
      setConnectionStatus('reconnecting');
    });

    socketInstance.io.on('reconnect', () => {
      setConnectionStatus('connected');
      addToast({
        title: 'Reconnected to Server',
        message: 'Real-time WebSocket connection restored.',
        type: 'info',
      });
    });

    // Real-time order created listener
    socketInstance.on('order:created', (newOrder) => {
      console.log('[Socket Event] order:created', newOrder);
      
      // Invalidate queries so UI reflects immediately without refresh
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-per-day'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-revenue'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-top-items'] });
      queryClient.invalidateQueries({ queryKey: ['archive-stats'] });

      addToast({
        title: '🚀 New Order Placed!',
        message: `Order #${newOrder.id} placed for ${newOrder.store_id} ($${newOrder.total_amount.toFixed(2)})`,
        type: 'success',
      });
    });

    // Real-time order status updated listener
    socketInstance.on('order:updated', (updatedOrder) => {
      console.log('[Socket Event] order:updated', updatedOrder);

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-per-day'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-revenue'] });

      addToast({
        title: '⚡ Status Updated',
        message: `Order #${updatedOrder.id} changed to status: ${updatedOrder.status}`,
        type: 'info',
      });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [queryClient, addToast, activeStore]);

  // Handle joining store room
  const setActiveStore = useCallback(
    (storeId) => {
      if (socket && socket.connected) {
        if (activeStore) {
          socket.emit('leave:store', activeStore);
        }
        if (storeId) {
          socket.emit('join:store', storeId);
        }
      }
      setActiveStoreState(storeId);
    },
    [socket, activeStore]
  );

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected: connectionStatus === 'connected',
        connectionStatus,
        activeStore,
        setActiveStore,
        toastNotifications,
        removeToast,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
