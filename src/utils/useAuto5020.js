import { useState, useCallback } from 'react';
import axios from './axios';

const useAuto5020 = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const autoAllocate = useCallback(async (monthlyIncome, currency, refreshCallback) => {
    setIsLoading(true);
    setError(null);

    if (typeof monthlyIncome !== 'number' || monthlyIncome <= 0) {
      setError('Please provide a valid positive monthly income for allocation.');
      setIsLoading(false);
      return;
    }

    try {
      const payload = { monthlyIncome };
      if (currency) {
        payload.currency = currency;
      }
      
      await axios.post('/budgets/auto-allocate', payload);
      
      if (refreshCallback && typeof refreshCallback === 'function') {
        refreshCallback();
      }
    } catch (err) {
      console.error('Error during budget auto-allocation:', err);
      setError(err.response?.data?.error || err.response?.data?.msg || 'Failed to auto-allocate budgets. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { autoAllocate, isLoading, error };
};

export default useAuto5020;
