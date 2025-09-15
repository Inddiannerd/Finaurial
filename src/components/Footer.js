import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white/90 backdrop-blur-sm shadow-lg mt-auto border-t border-teal-100">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center text-teal-600 text-sm">
        &copy; {new Date().getFullYear()} Finaurial. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
