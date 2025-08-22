import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BudgetForm = () => {
  const navigate = useNavigate();
  const [budgets, setBudgets] = useState([]);
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState('');
  const [month, setMonth] = useState(new Date().toISOString().slice(0,7)); // YYYY-MM
  const [error, setError] = useState('');

  useEffect(() => {
    // Sample data
    const sampleBudgets = [
      { _id: '1', month: '2025-08', category: 'Groceries', limit: 500 },
      { _id: '2', month: '2025-08', category: 'Entertainment', limit: 200 },
      { _id: '3', month: '2025-08', category: 'Utilities', limit: 300 }
    ];
    setBudgets(sampleBudgets);
  }, []);

  const handleAddBudget = (e) => {
    e.preventDefault();
    if (!category || !limit) {
      setError('Please fill in all fields');
      return;
    }

    const newBudget = {
      _id: Date.now().toString(),
      month,
      category,
      limit: parseFloat(limit)
    };

    setBudgets([...budgets, newBudget]);
    setCategory('');
    setLimit('');
    setError('');
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 border rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Manage Budgets</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <form onSubmit={handleAddBudget} className="space-y-4 mb-8">
        <input 
          type="month" 
          value={month} 
          onChange={e => setMonth(e.target.value)} 
          className="w-full p-2 border rounded"
          required
        />
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
        <button className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 w-full">Add / Update Budget</button>
      </form>

      <h3 className="text-xl font-semibold mb-3">Existing Budgets</h3>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-3 py-1">Month</th>
            <th className="border border-gray-300 px-3 py-1">Category</th>
            <th className="border border-gray-300 px-3 py-1">Limit</th>
          </tr>
        </thead>
        <tbody>
          {budgets.map(b => (
            <tr key={b._id}>
              <td className="border border-gray-300 px-3 py-1">{b.month}</td>
              <td className="border border-gray-300 px-3 py-1">{b.category}</td>
              <td className="border border-gray-300 px-3 py-1">${b.limit.toFixed(2)}</td>
            </tr>
          ))}
          {!budgets.length && (
            <tr>
              <td colSpan="3" className="text-center py-4 text-gray-500">No budgets set</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default BudgetForm;
