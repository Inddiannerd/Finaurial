import React, { useState, useEffect, useRef } from 'react';
import axios from '../utils/axios';
import { useNotification } from '../context/NotificationContext';

const TransactionForm = ({ onTransactionAdded, onTransactionUpdated, onCancel, transaction }) => {
  const { showNotification } = useNotification();
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const typeInputRef = useRef(null);

  const isEditMode = transaction && transaction._id;

  useEffect(() => {
    if (typeInputRef.current) {
      typeInputRef.current.focus();
    }

    if (isEditMode) {
      setType(transaction.type || 'expense');
      setCategory(transaction.category || '');
      setAmount(transaction.amount || '');
      setDate(transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
      setDescription(transaction.description || '');
    } else {
      setType('expense');
      setCategory('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
    }
  }, [transaction, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
        showNotification('Please enter a valid amount.', 'error');
        return;
    }

    const transactionData = { type, category, amount: parseFloat(amount), date, description };

    try {
      if (isEditMode) {
        const res = await axios.put(`/transactions/${transaction._id}`, transactionData);
        if (onTransactionUpdated) onTransactionUpdated(res.data.data);
        showNotification('Transaction updated successfully!', 'success');
      } else {
        const res = await axios.post('/transactions', transactionData);
        if (onTransactionAdded) onTransactionAdded(res.data.data);
        showNotification('Transaction added successfully!', 'success');
      }
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to process transaction', 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold">{isEditMode ? 'Edit Transaction' : 'Add Transaction'}</h2>
      
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-light-secondary dark:text-dark-secondary">Type</label>
        <select id="type" ref={typeInputRef} value={type} onChange={(e) => setType(e.target.value)} className="mt-1 block w-full">
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-light-secondary dark:text-dark-secondary">Category</label>
        <input id="category" type="text" value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 block w-full" required />
      </div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-light-secondary dark:text-dark-secondary">Amount</label>
        <input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1 block w-full" required min="0.01" step="0.01" />
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-light-secondary dark:text-dark-secondary">Date</label>
        <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 block w-full" required />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-light-secondary dark:text-dark-secondary">Description</label>
        <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 block w-full" rows="3" />
      </div>

      <div className="flex space-x-4 pt-4">
        <button type="submit" className="flex-1 bg-light-accent text-white p-2 rounded-md hover:opacity-90 transition-opacity min-h-[44px]">
          {isEditMode ? 'Update' : 'Add'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="flex-1 bg-gray-200 dark:bg-gray-600 p-2 rounded-md hover:opacity-90 transition-opacity min-h-[44px]">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default TransactionForm;
