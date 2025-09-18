import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useFeatures } from '../context/FeatureContext';

const CurrencySelector = () => {
  const { currency, setCurrency, supportedCurrencies } = useCurrency();

  return (
    <div className="relative">
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        className="-ml-2 appearance-none bg-transparent text-light-secondary dark:text-dark-secondary font-medium rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent"
        aria-label="Select currency"
      >
        {Object.keys(supportedCurrencies).map(code => (
          <option key={code} value={code} className="bg-light-input dark:bg-dark-input text-light-text dark:text-dark-text">
            {supportedCurrencies[code].symbol} {code}
          </option>
        ))}
      </select>
    </div>
  );
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { featureFlags } = useFeatures();
  const [isOpen, setIsOpen] = useState(false);

  const userRole = user?.role || 'user';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClasses = ({ isActive }) =>
    `block sm:inline-flex items-center px-3 py-2 rounded-md text-sm font-medium min-h-[44px] transition-colors ` +
    (isActive
      ? 'bg-light-accent text-white'
      : 'text-light-secondary dark:text-dark-secondary hover:bg-gray-200 dark:hover:bg-gray-700');

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', flag: true },
    { to: '/transactions', label: 'Transactions', flag: featureFlags.Transactions },
    { to: '/budgets', label: 'Budgets', flag: featureFlags.Budgets },
    { to: '/reports', label: 'Reports', flag: featureFlags.Reports },
    { to: '/savings', label: 'Savings', flag: featureFlags.Savings },
    { to: '/goals', label: 'Goals', flag: featureFlags.Goals },
    { to: '/contact-us', label: 'Contact Us', flag: true },
    { to: '/admin', label: 'Admin', flag: userRole === 'admin' },
  ];

  return (
    <nav className="bg-light-input/80 dark:bg-dark-input/80 backdrop-blur-md shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="text-2xl font-bold text-light-accent dark:text-dark-accent">
              Finaurial
            </Link>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-1">
            {navItems.map(item => item.flag && (
              <NavLink key={item.to} to={item.to} className={navLinkClasses}>{item.label}</NavLink>
            ))}
          </div>
          <div className="flex items-center">
            <CurrencySelector />
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-light-secondary dark:text-dark-secondary hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-accent dark:focus:ring-dark-accent"
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? '☀️' : '🌙'}
            </button>
            <button
              onClick={handleLogout}
              className="hidden sm:block bg-light-error text-white px-4 py-2 rounded-md ml-4 hover:opacity-90 min-h-[44px]"
            >
              Logout
            </button>
            <div className="sm:hidden ml-2">
              <button
                onClick={() => setIsOpen(!isOpen)}
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-light-secondary hover:bg-gray-700 focus:outline-none"
                aria-controls="mobile-menu"
                aria-expanded={isOpen}
              >
                <span className="sr-only">Open main menu</span>
                {isOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="sm:hidden bg-light-input dark:bg-dark-input" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map(item => item.flag && (
              <NavLink key={item.to} to={item.to} className={navLinkClasses} onClick={() => setIsOpen(false)}>{item.label}</NavLink>
            ))}
            <button
              onClick={() => { handleLogout(); setIsOpen(false); }}
              className="block w-full text-left bg-light-error text-white px-3 py-2 rounded-md mt-2 hover:opacity-90 min-h-[44px]"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;