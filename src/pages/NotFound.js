import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50">
      <div className="bg-white/90 backdrop-blur-sm shadow-lg rounded-lg p-8 text-center border border-teal-100">
        <h1 className="text-4xl font-bold text-teal-800 mb-4">404</h1>
        <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
        <Link 
          to="/dashboard" 
          className="inline-block px-6 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition duration-200"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;