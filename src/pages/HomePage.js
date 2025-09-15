import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="text-2xl font-bold text-blue-600">Finaurial</Link>
            <div className="flex items-center space-x-6">
              <Link to="/" className="text-gray-700 hover:text-blue-600">Dashboard</Link>
              <Link to="/add-transaction" className="text-gray-700 hover:text-blue-600">Add Transaction</Link>
              <Link to="/budget" className="text-gray-700 hover:text-blue-600">Budgets</Link>
              <Link to="/reports" className="text-gray-700 hover:text-blue-600">Reports</Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto py-8 px-4">
        <Outlet />
      </main>
    </div>
  );
};

export default Home;