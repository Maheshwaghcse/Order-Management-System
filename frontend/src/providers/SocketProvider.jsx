'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';

const SocketContext = createContext();

const SOCKET_URL = (process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000')
  .replace(/\/+$/, '')
  .replace(/\/api$/, '');

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [activeStore, setActiveStoreState] = useState('');
  const [toastNotifications, setToastNotifications] = useState([]);
  const queryClient = useQueryClient();

  const addToast = useCallback((toast) => {
    const id = Date.now();
    setToastNotifications((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToastNotifications((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToastNotifications((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      setConnectionStatus('connected');
      if (activeStore) {
        socketInstance.emit('join:store', activeStore);
      }
    });

    socketInstance.on('disconnect', () => {
      setConnectionStatus('disconnected');
    });

    socketInstance.on('order:created', (newOrder) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-per-day'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-revenue'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-top-items'] });
      queryClient.invalidateQueries({ queryKey: ['archive-stats'] });

      addToast({
        title: 'New Order Placed!',
        message: `Order #${newOrder.id} placed (₹${newOrder.total_amount})`,
        type: 'success',
      });
    });

    socketInstance.on('order:updated', (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-per-day'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-revenue'] });

      addToast({
        title: 'Order Status Updated',
        message: `Order #${updatedOrder.id} is now ${updatedOrder.status}`,
        type: 'info',
      });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [queryClient, addToast, activeStore]);

  const setActiveStore = useCallback((storeId) => {
    if (socket && socket.connected) {
      if (activeStore) socket.emit('leave:store', activeStore);
      if (storeId) socket.emit('join:store', storeId);
    }
    setActiveStoreState(storeId);
  }, [socket, activeStore]);

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
