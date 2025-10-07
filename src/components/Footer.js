import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-light-card/80 dark:bg-dark-card/80 backdrop-blur-sm shadow-lg mt-auto border-t border-light-border/20 dark:border-dark-border/20">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center text-light-secondary dark:text-dark-secondary text-sm">
        &copy; {new Date().getFullYear()} Finaurial. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
