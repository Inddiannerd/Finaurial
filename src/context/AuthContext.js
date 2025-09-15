import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken);
        // Check if token is expired
        if (decoded.exp * 1000 < Date.now()) {
          logout(); // Use logout to clear everything
        } else {
          setToken(storedToken);
          setUser(decoded.user);
        }
      } catch (error) {
        console.error('Invalid token on initial load', error);
        logout(); // Clear invalid token
      }
    }
  }, []);

  const login = (newToken) => {
    try {
      const decoded = jwtDecode(newToken);
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(decoded.user);
    } catch (error) {
      console.error('Failed to decode new token on login', error);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};