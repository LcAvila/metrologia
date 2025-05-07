'use client';
import { createContext, useContext, useState, ReactNode } from 'react';
import Notification, { NotificationType, NotificationProps } from '../components/Notification';

interface NotificationContextType {
  showNotification: (type: NotificationType, message: string, duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);

  const showNotification = (type: NotificationType, message: string, duration = 5000) => {
    const id = Date.now().toString();
    const newNotification: NotificationProps = {
      id,
      type,
      message,
      duration,
      onClose: () => removeNotification(id)
    };
    
    setNotifications(prev => [...prev, newNotification]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {notifications.map((notification, index) => (
          <div 
            key={notification.id} 
            style={{ marginTop: `${index * 0.5}rem` }}
            className="notification-container"
          >
            <Notification {...notification} />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification deve ser usado dentro de um NotificationProvider');
  }
  return context;
}