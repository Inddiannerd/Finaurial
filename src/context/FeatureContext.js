import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from '../utils/axios';
import { useAuth } from './AuthContext';

const FeatureContext = createContext();

const DEFAULT_FEATURES = {
  Transactions: true,
  Budgets: true,
  Reports: true,
  Savings: true,
  Goals: true,
};

export const FeatureProvider = ({ children }) => {
  const { token } = useAuth();
  const [featureFlags, setFeatureFlags] = useState(DEFAULT_FEATURES);

  const fetchFeatureFlags = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get('/admin/features');
      if (res.data) {
        const flags = res.data.reduce((acc, flag) => {
          const name = flag.name || flag.feature;
          if (name) {
            acc[name] = flag.isEnabled !== undefined ? flag.isEnabled : flag.enabled;
          }
          return acc;
        }, { ...DEFAULT_FEATURES });
        setFeatureFlags(flags);
      }
    } catch (err) {
      console.warn('Could not fetch feature flags, falling back to defaults.');
      setFeatureFlags(DEFAULT_FEATURES);
    }
  }, [token]);

  useEffect(() => {
    fetchFeatureFlags();
  }, [fetchFeatureFlags]);

  const updateFeatureFlag = (name, isEnabled) => {
    setFeatureFlags(prevFlags => ({ ...prevFlags, [name]: isEnabled }));
  };

  return (
    <FeatureContext.Provider value={{ featureFlags, fetchFeatureFlags, updateFeatureFlag }}>
      {children}
    </FeatureContext.Provider>
  );
};

export const useFeatures = () => useContext(FeatureContext);
