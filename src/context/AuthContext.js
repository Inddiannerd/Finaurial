import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from '../utils/axios';

export const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  const fetchUser = useCallback(async () => {
    if (token) {
      try {
        const res = await axios.get('/auth/me');
        setUser(res.data);
      } catch (error) {
        console.error('Failed to fetch user', error);
        logout();
      }
    }
  }, [token]);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken);
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        } else {
          setToken(storedToken);
          fetchUser();
        }
      } catch (error) {
        console.error('Invalid token on initial load', error);
        logout();
      }
    }
  }, [fetchUser]);

  const login = (newToken) => {
    try {
      const decoded = jwtDecode(newToken);
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(decoded.user);
      fetchUser();
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
    <AuthContext.Provider value={{ token, user, login, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};