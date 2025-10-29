import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Load notifications from localStorage on mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem('app-notifications');
    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications));
      } catch (error) {
        console.error('Error loading notifications from localStorage:', error);
      }
    }
  }, []);

  // Save notifications to localStorage whenever notifications change
  useEffect(() => {
    localStorage.setItem('app-notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (type, message, options = {}) => {
    const id = Date.now() + Math.random();
    const timestamp = new Date();
    
    const notification = {
      id,
      type, // 'success', 'error', 'warning', 'info'
      message,
      timestamp,
      read: false,
      ...options
    };

    setNotifications(prev => [notification, ...prev]);

    // Show toast notification
    switch (type) {
      case 'success':
        toast.success(message, { id: `toast-${id}` });
        break;
      case 'error':
        toast.error(message, { id: `toast-${id}` });
        break;
      case 'warning':
        toast(message, { 
          icon: '⚠️',
          style: {
            background: '#fef3c7',
            color: '#92400e',
            border: '1px solid #f59e0b'
          },
          id: `toast-${id}`
        });
        break;
      case 'info':
        toast(message, { 
          icon: 'ℹ️',
          style: {
            background: '#dbeafe',
            color: '#1e40af',
            border: '1px solid #3b82f6'
          },
          id: `toast-${id}`
        });
        break;
      default:
        toast(message, { id: `toast-${id}` });
    }

    return id;
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const removeAllNotifications = () => {
    setNotifications([]);
  };

  const getUnreadCount = () => {
    return notifications.filter(notification => !notification.read).length;
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Convenience methods for different notification types
  const showSuccess = (message, options) => addNotification('success', message, options);
  const showError = (message, options) => addNotification('error', message, options);
  const showWarning = (message, options) => addNotification('warning', message, options);
  const showInfo = (message, options) => addNotification('info', message, options);

  const value = {
    notifications,
    isSidebarOpen,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    removeAllNotifications,
    getUnreadCount,
    toggleSidebar,
    closeSidebar,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
