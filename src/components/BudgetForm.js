import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { useNotification } from '../context/NotificationContext';

const BudgetForm = ({ onBudgetAdded, budgetToEdit, onFormSubmit }) => {
  const { showNotification } = useNotification();
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (budgetToEdit) {
      setCategory(budgetToEdit.category);
      setAmount(budgetToEdit.amount);
    } else {
      setCategory('');
      setAmount('');
    }
  }, [budgetToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numericAmount = parseFloat(String(amount).replace(/[^\d.-]/g, ''));

    if (!category || !amount) {
      showNotification('Please fill in all fields', 'error');
      return;
    }

    if (isNaN(numericAmount) || numericAmount <= 0) {
      showNotification('Please enter a valid positive number for the amount.', 'error');
      return;
    }

    const budgetData = { category, amount: numericAmount };

    try {
      if (budgetToEdit) {
        await axios.put(`/budgets/${budgetToEdit._id}`, budgetData);
        showNotification('Budget updated successfully!', 'success');
      } else {
        await axios.post('/budgets', budgetData);
        showNotification('Budget added successfully!', 'success');
      }

      if (onFormSubmit) {
        onFormSubmit();
      }
      if (onBudgetAdded) {
        onBudgetAdded();
      }

      // Clear form if not editing
      if (!budgetToEdit) {
        setCategory('');
        setAmount('');
      }
    } catch (err) {
      showNotification(err.response?.data?.error || `Failed to ${budgetToEdit ? 'update' : 'add'} budget`, 'error');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">{budgetToEdit ? 'Edit Budget' : 'Add Budget'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          type="text" 
          placeholder="Category" 
          value={category} 
          onChange={e => setCategory(e.target.value)} 
          className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          required  
        />
        <input 
          type="text" 
          placeholder="Monthly Amount" 
          value={amount} 
          onChange={e => setAmount(e.target.value)} 
          className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          required  
        />
        <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 w-full">{budgetToEdit ? 'Update Budget' : 'Add Budget'}</button>
      </form>
    </div>
  );
};

export default BudgetForm;
