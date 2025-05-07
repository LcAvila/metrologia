'use client';
import { useEffect, useState } from 'react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationProps {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
  onClose?: () => void;
}

const Notification = ({ id, type, message, duration = 5000, onClose }: NotificationProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  // Cores baseadas no tipo de notificação
  const typeStyles = {
    success: 'bg-green-100 border-green-500 text-green-800',
    error: 'bg-red-100 border-red-500 text-red-800',
    warning: 'bg-yellow-100 border-yellow-500 text-yellow-800',
    info: 'bg-blue-100 border-blue-500 text-blue-800'
  };

  // Ícones baseados no tipo de notificação
  const typeIcons = {
    success: 'bx bx-check-circle',
    error: 'bx bx-x-circle',
    warning: 'bx bx-error',
    info: 'bx bx-info-circle'
  };

  useEffect(() => {
    // Animar entrada
    setTimeout(() => setIsVisible(true), 100);
    
    // Configurar temporizador para fechar
    const timer = setTimeout(() => {
      handleClose();
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300); // Tempo da animação de saída
  };

  return (
    <div 
      className={`fixed flex items-center p-4 mb-4 rounded-lg border-l-4 shadow-lg transition-all duration-300 transform ${typeStyles[type]} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${isLeaving ? 'opacity-0 translate-x-full' : ''}`}
      style={{ 
        zIndex: 9999, 
        right: '1rem',
        maxWidth: '24rem',
        animation: isLeaving ? 'none' : 'bounce-in 0.5s ease-out'
      }}
    >
      <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg">
        <i className={`${typeIcons[type]} text-xl`}></i>
      </div>
      <div className="ml-3 text-sm font-normal">{message}</div>
      <button 
        type="button" 
        className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 hover:bg-gray-200 hover:text-gray-900 focus:ring-2 focus:ring-gray-300"
        onClick={handleClose}
        aria-label="Fechar"
      >
        <i className="bx bx-x text-lg"></i>
      </button>
    </div>
  );
};

export default Notification;