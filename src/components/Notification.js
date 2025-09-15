import React, { useState, useEffect } from 'react';

const Notification = ({ message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) {
        onClose();
      }
    }, 5000); // Notification disappears after 5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null;

  const bgColor = type === 'error' ? 'bg-red-500' : 'bg-green-500';

  return (
    <div className={`fixed bottom-4 right-4 ${bgColor} text-white px-4 py-2 rounded-md shadow-lg z-50`}>
      {message}
      <button onClick={() => setIsVisible(false)} className="ml-2 font-bold">
        &times;
      </button>
    </div>
  );
};

export default Notification;
