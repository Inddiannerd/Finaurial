import React, { useState, useEffect, useCallback } from 'react';
import axios from '../utils/axios';
import { useNotification } from '../context/NotificationContext';
import Card from '../components/Card';
import { useCurrency } from '../context/CurrencyContext';

const SavingsPage = () => {
  const { showNotification } = useNotification();
  const { formatCurrency } = useCurrency();
  const [summary, setSummary] = useState({ totalSavings: 0 });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ amount: '', type: 'deposit', note: '', date: new Date().toISOString().split('T')[0] });

  const fetchData = useCallback(async () => {
    try {
      const [summaryRes, historyRes] = await Promise.all([axios.get('/savings/summary'), axios.get('/savings')]);
      setSummary(summaryRes.data.data);
      setHistory(historyRes.data.data);
    } catch (err) {
      showNotification('Failed to fetch savings data', 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || form.amount <= 0) return showNotification('Please enter a valid amount', 'error');
    if (!form.date) return showNotification('Please select a date', 'error');
    try {
      await axios.post('/savings', { ...form, date: new Date(form.date).toISOString() });
      showNotification(`Transaction successful!`, 'success');
      setForm({ amount: '', type: 'deposit', note: '', date: new Date().toISOString().split('T')[0] });
      fetchData();
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Transaction failed';
      showNotification(errorMessage, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await axios.delete(`/savings/${id}`);
        showNotification('Entry deleted', 'success');
        fetchData();
      } catch (err) {
        showNotification('Failed to delete entry', 'error');
      }
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all savings history? This action cannot be undone.')) {
      try {
        await axios.delete('/savings');
        showNotification('Savings history cleared', 'success');
        fetchData();
      } catch (err) {
        showNotification('Failed to clear history', 'error');
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Savings</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">History</h2>
              {history.length > 0 && (
                <button onClick={handleClearAll} className="btn btn-danger">Clear All</button>
              )}
            </div>
            <ul className="divide-y divide-light-border dark:divide-dark-border">
              {history.map(item => (
                <li key={item._id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className={`font-semibold ${item.type === 'deposit' ? 'text-light-success' : 'text-light-error'}`}>{item.type}</p>
                    <p className="text-sm text-light-secondary dark:text-dark-secondary">{item.note || '-'}</p>
                  </div>
                  <div className="text-right flex items-center">
                    <div>
                      <p className="font-bold text-lg">{formatCurrency(item.amount)}</p>
                      <p className="text-sm text-light-secondary dark:text-dark-secondary">{new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}</p>
                    </div>
                    <button onClick={() => handleDelete(item._id)} className="ml-4 text-red-500 hover:text-red-700">🗑️</button>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <h2 className="text-xl font-bold mb-2">Total Savings</h2>
            <p className="text-4xl font-bold text-light-accent dark:text-dark-accent">{formatCurrency(summary.totalSavings)}</p>
          </Card>
          <Card>
            <h2 className="text-xl font-bold mb-4">Add Savings</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="number" name="amount" placeholder="Amount" value={form.amount} onChange={handleChange} required className="w-full p-2" />
              <input type="date" name="date" value={form.date} onChange={handleChange} required className="w-full p-2" />
              <select name="type" value={form.type} onChange={handleChange} className="w-full p-2"><option value="deposit">Deposit</option><option value="withdrawal">Withdrawal</option></select>
              <input type="text" name="note" placeholder="Note" value={form.note} onChange={handleChange} className="w-full p-2" />
              <button type="submit" className="w-full btn btn-primary">Submit</button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SavingsPage;