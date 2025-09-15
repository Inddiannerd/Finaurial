import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';

const CurrencyContext = createContext();

export const useCurrency = () => useContext(CurrencyContext);

const supportedCurrencies = {
  USD: { symbol: '$', locale: 'en-US' },
  INR: { symbol: '₹', locale: 'en-IN' },
  EUR: { symbol: '€', locale: 'de-DE' },
  GBP: { symbol: '£', locale: 'en-GB' },
  JPY: { symbol: '¥', locale: 'ja-JP' },
  CAD: { symbol: 'CA$', locale: 'en-CA' },
  AUD: { symbol: 'A$', locale: 'en-AU' },
  SGD: { symbol: 'S$', locale: 'en-SG' },
  CHF: { symbol: 'CHF', locale: 'de-CH' },
  CNY: { symbol: '¥', locale: 'zh-CN' },
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    try {
      const saved = localStorage.getItem('finaurial-currency');
      return saved && supportedCurrencies[saved] ? saved : 'USD';
    } catch (error) {
      return 'USD';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('finaurial-currency', currency);
    } catch (error) {
      console.warn('Could not save currency to localStorage');
    }
  }, [currency]);

  const formatCurrency = useMemo(() => (value) => {
    const { locale } = supportedCurrencies[currency];
    const numberValue = Number(value);
    if (isNaN(numberValue)) {
        return new Intl.NumberFormat(supportedCurrencies['USD'].locale, { style: 'currency', currency: 'USD' }).format(0);
    }
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(numberValue);
  }, [currency]);

  const value = {
    currency,
    setCurrency,
    formatCurrency,
    supportedCurrencies,
    symbol: supportedCurrencies[currency].symbol,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};
