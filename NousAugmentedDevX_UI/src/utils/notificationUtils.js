// Utility functions to help migrate from direct toast calls to the notification system
// This file provides backward compatibility while encouraging use of the new system

import { toast } from 'react-hot-toast';

// Legacy toast functions that also add to notification history
// These can be used as drop-in replacements for existing toast calls
export const legacyToast = {
  success: (message, options = {}) => {
    // Show the toast
    toast.success(message, options);
    
    // Also add to notification history if context is available
    try {
      // This will work if the component is wrapped in NotificationProvider
      const { useNotifications } = require('../context/NotificationContext');
      // Note: This won't work in all contexts, but it's a graceful fallback
    } catch (error) {
      // Silently fail if context is not available
    }
  },

  error: (message, options = {}) => {
    toast.error(message, options);
  },

  warning: (message, options = {}) => {
    toast(message, { 
      icon: '⚠️',
      style: {
        background: '#fef3c7',
        color: '#92400e',
        border: '1px solid #f59e0b'
      },
      ...options
    });
  },

  info: (message, options = {}) => {
    toast(message, { 
      icon: 'ℹ️',
      style: {
        background: '#dbeafe',
        color: '#1e40af',
        border: '1px solid #3b82f6'
      },
      ...options
    });
  }
};

// Hook to get notification functions
// Use this in components that need to add notifications to the sidebar
export const useNotificationToast = () => {
  try {
    const { useNotifications } = require('../context/NotificationContext');
    const { showSuccess, showError, showWarning, showInfo } = useNotifications();
    
    return {
      success: showSuccess,
      error: showError,
      warning: showWarning,
      info: showInfo
    };
  } catch (error) {
    // Fallback to legacy toast if context is not available
    return legacyToast;
  }
};
