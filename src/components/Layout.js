import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import Notification from './Notification'; // Assuming you have this for toasts

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <Navbar />
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
        {/* The Outlet will be rendered here, no extra wrapping div needed unless for specific styling */}
        <Outlet />
      </main>
      <Footer />
      <Notification />
    </div>
  );
};

export default Layout;