import React, { useState, useEffect } from 'react';

function Notification({ message, type = 'success', duration = 2000, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const colors = {
    success: '#4ecdc4',
    error: '#ff6b6b',
    info: '#4e92cd'
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: colors[type],
        color: 'white',
        padding: '1rem 2rem',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        animation: 'fadeOut 2s ease-in-out',
        zIndex: 1100
      }}
    >
      {message}
      <style>
        {`
          @keyframes fadeOut {
            0% { opacity: 1; }
            70% { opacity: 1; }
            100% { opacity: 0; }
          }
        `}
      </style>
    </div>
  );
}

export default Notification;
