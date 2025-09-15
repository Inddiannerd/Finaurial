import React from 'react';

const Card = ({ children, className }) => {
  return (
    <div className={`bg-light-input dark:bg-dark-input shadow-lg rounded-lg p-6 border border-light-border dark:border-dark-border ${className}`}>
      {children}
    </div>
  );
};

export default Card;