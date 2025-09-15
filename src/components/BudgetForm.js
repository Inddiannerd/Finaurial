import React, { useState } from 'react';
import axios from 'axios';
import { useNotification } from '../context/NotificationContext'; // Import useNotification

const BudgetForm = ({ onBudgetAdded }) => {
  const { showNotification } = useNotification(); // Use the hook
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState('');
  // Removed local error state

  const handleAddBudget = async (e) => {
    e.preventDefault();
    if (!category || !limit) {
      showNotification('Please fill in all fields', 'error'); // Show error notification
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'x-auth-token': token,
        },
      };
      await axios.post('http://localhost:5000/api/budgets', {
        category,
        limit: parseFloat(limit),
      }, config);

      showNotification('Budget added successfully!', 'success'); // Show success notification

      // Clear form
      setCategory('');
      setLimit('');

      if (onBudgetAdded) {
        onBudgetAdded(); // Call callback to refresh list
      }
    } catch (err) {
      showNotification(err.response?.data?.msg || 'Failed to add budget', 'error'); // Show error notification
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Add Budget</h2>
      {/* Removed local error display as notifications handle it */}
      <form onSubmit={handleAddBudget} className="space-y-4">
        <input 
          type="text" 
          placeholder="Category" 
          value={category} 
          onChange={e => setCategory(e.target.value)} 
          className="w-full p-2 border rounded"
          required  
        />
        <input 
          type="number" 
          step="0.01" 
          placeholder="Monthly Limit" 
          value={limit} 
          onChange={e => setLimit(e.target.value)} 
          className="w-full p-2 border rounded"
          required  
        />
        <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 w-full">Add Budget</button>
      </form>
    </div>
  );
};

export default BudgetForm;
