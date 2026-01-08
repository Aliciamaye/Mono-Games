import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckIcon, AlertIcon, InfoIcon, TrophyIcon } from './Icons';
import { useNotifications } from '../hooks/useWebSocket';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'achievement';
  title: string;
  message: string;
  icon?: string;
  duration?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Listen for WebSocket notifications
  useNotifications((notification) => {
    showNotification({
      type: notification.type || 'info',
      title: notification.title,
      message: notification.message,
      icon: notification.icon,
      duration: 5000
    });
  });

  const showNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = `${Date.now()}-${Math.random()}`;
    const newNotification: Notification = {
      id,
      duration: 5000,
      ...notification
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto remove after duration
    if (newNotification.duration) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, showNotification, removeNotification }}>
      {children}
      <NotificationContainer notifications={notifications} onRemove={removeNotification} />
    </NotificationContext.Provider>
  );
};

// Notification Container
interface NotificationContainerProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

const NotificationContainer: React.FC<NotificationContainerProps> = ({ notifications, onRemove }) => {
  return (
    <div style={{
      position: 'fixed',
      top: '1rem',
      right: '1rem',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      maxWidth: '400px',
      width: '100%'
    }}>
      {notifications.map(notification => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onRemove={() => onRemove(notification.id)}
        />
      ))}
    </div>
  );
};

// Individual Toast
interface NotificationToastProps {
  notification: Notification;
  onRemove: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(onRemove, 300);
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckIcon size={20} color="white" />;
      case 'error':
        return <AlertIcon size={20} color="white" />;
      case 'achievement':
        return <TrophyIcon size={20} color="white" />;
      default:
        return <InfoIcon size={20} color="white" />;
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return 'linear-gradient(135deg, #10B981 0%, #059669 100%)';
      case 'error':
        return 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)';
      case 'achievement':
        return 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)';
      default:
        return 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)';
    }
  };

  const getShadowColor = () => {
    switch (notification.type) {
      case 'success':
        return '#059669';
      case 'error':
        return '#DC2626';
      case 'achievement':
        return '#D97706';
      default:
        return '#2563EB';
    }
  };

  return (
    <div
      className={`notification-toast ${isExiting ? 'notification-exit' : 'notification-enter'}`}
      style={{
        background: getBackgroundColor(),
        padding: '1rem',
        borderRadius: 'var(--radius-lg)',
        border: '3px solid rgba(255, 255, 255, 0.2)',
        boxShadow: `0 4px 12px ${getShadowColor()}66`,
        color: 'white',
        fontFamily: "'Comic Sans MS', cursive",
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        animation: isExiting ? 'slideOut 0.3s ease' : 'slideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}
      onClick={handleRemove}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        {/* Icon */}
        <div style={{
          width: '36px',
          height: '36px',
          minWidth: '36px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {notification.icon ? (
            <span style={{ fontSize: '1.25rem' }}>{notification.icon}</span>
          ) : (
            getIcon()
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontWeight: 700,
            fontSize: '1rem',
            marginBottom: '0.25rem',
            lineHeight: 1.3
          }}>
            {notification.title}
          </div>
          <div style={{
            fontSize: '0.875rem',
            opacity: 0.95,
            lineHeight: 1.4
          }}>
            {notification.message}
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRemove();
          }}
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.125rem',
            fontWeight: 700,
            transition: 'all 0.2s ease',
            padding: 0
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          ×
        </button>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(120%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideOut {
          from {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
          to {
            transform: translateX(120%) scale(0.8);
            opacity: 0;
          }
        }

        .notification-toast:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px ${getShadowColor()}88;
        }
      `}</style>
    </div>
  );
};
