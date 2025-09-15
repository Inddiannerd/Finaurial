import React, { useState, useEffect, useCallback } from 'react';
import axios from '../utils/axios';
import { useNotification } from '../context/NotificationContext';
import { useCurrency } from '../context/CurrencyContext';
import Card from '../components/Card';
import BudgetForm from '../components/BudgetForm';

const SkeletonCard = () => (
  <Card>
    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-4"></div>
    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mt-2"></div>
  </Card>
);

const BudgetsPage = () => {
  const { showNotification } = useNotification();
  const { formatCurrency } = useCurrency();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/budgets');
      setBudgets(res.data.data || []);
    } catch (err) {
      setError('Could not fetch budgets. You can still add a new one.');
      setBudgets([]); // Ensure budgets is an array on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const handleBudgetAdded = (newBudget) => {
    setBudgets(prev => [newBudget, ...prev]);
    fetchBudgets(); // Refetch to get updated calculated fields
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Budgets</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <h2 className="text-xl font-bold mb-4">Existing Budgets</h2>
            {error && (
              <div className="bg-light-error/20 border border-light-error/50 text-light-error dark:text-dark-error px-4 py-3 rounded-md mb-4">
                <p>{error} <button onClick={fetchBudgets} className="font-semibold underline">Retry</button></p>
              </div>
            )}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : budgets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {budgets.map(budget => {
                  const spent = budget.spent || 0;
                  const progress = budget.amount > 0 ? Math.min((spent / budget.amount) * 100, 100) : 0;
                  const progressColor = progress > 90 ? 'bg-light-error' : progress > 70 ? 'bg-yellow-500' : 'bg-light-success';
                  return (
                    <Card key={budget._id}>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{budget.category}</h3>
                      <p className="text-sm text-light-secondary dark:text-dark-secondary">Budget: {formatCurrency(budget.amount)}</p>
                      <p className="font-semibold">Spent: {formatCurrency(spent)}</p>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mt-2">
                        <div className={`${progressColor} h-4 rounded-full`} style={{ width: `${progress}%` }}></div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              !error && <p className="text-center py-10 text-gray-500 dark:text-gray-400">No budgets found. Add one to get started!</p>
            )}
          </Card>
        </div>
        <div>
          <Card>
            <h2 className="text-xl font-bold mb-4">Add New Budget</h2>
            <BudgetForm onBudgetAdded={handleBudgetAdded} />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BudgetsPage;