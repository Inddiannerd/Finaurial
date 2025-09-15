import React, { useState, useEffect, useCallback } from 'react';
import axios from '../utils/axios';
import { useNotification } from '../context/NotificationContext';
import Card from '../components/Card';

import { useCurrency } from '../context/CurrencyContext';

const AddGoalForm = ({ onGoalAdded }) => {
  const { showNotification } = useNotification();
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !targetAmount) {
      showNotification('Please fill in at least name and target amount', 'error');
      return;
    }
    try {
      const goalData = { name, targetAmount: parseFloat(targetAmount) };
      if (deadline) {
        goalData.deadline = deadline;
      }
      await axios.post('/goals', goalData);
      showNotification('Goal added successfully!', 'success');
      setName('');
      setTargetAmount('');
      setDeadline('');
      if (onGoalAdded) {
        onGoalAdded();
      }
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to add goal', 'error');
    }
  };

  return (
    <Card>
      <h2 className="text-xl font-bold mb-4">Add New Goal</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="goal-name" className="block text-sm font-medium text-light-secondary dark:text-dark-secondary">Goal Name</label>
          <input id="goal-name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full" required />
        </div>
        <div>
          <label htmlFor="goal-target" className="block text-sm font-medium text-light-secondary dark:text-dark-secondary">Target Amount</label>
          <input id="goal-target" type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} className="mt-1 block w-full" required min="0.01" step="0.01" />
        </div>
        <div>
          <label htmlFor="goal-deadline" className="block text-sm font-medium text-light-secondary dark:text-dark-secondary">Deadline (Optional)</label>
          <input id="goal-deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="mt-1 block w-full" />
        </div>
        <button type="submit" className="w-full bg-light-accent text-white p-2 rounded-md hover:opacity-90 transition-opacity">
          Add Goal
        </button>
      </form>
    </Card>
  );
};

const GoalsPage = () => {
  const { showNotification } = useNotification();
  const { formatCurrency } = useCurrency();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get('/goals');
      setGoals(res.data.data);
    } catch (err) {
      showNotification('Failed to fetch goals', 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  if (loading && goals.length === 0) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Financial Goals</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AddGoalForm onGoalAdded={fetchGoals} />
        {goals.map(goal => {
          const progress = goal.targetAmount > 0 ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) : 0;
          return (
            <Card key={goal._id}>
              <h2 className="text-xl font-bold">{goal.name}</h2>
              <p className="text-sm text-light-secondary dark:text-dark-secondary">Target: {formatCurrency(goal.targetAmount)}</p>
              <p className="font-semibold">Current: {formatCurrency(goal.currentAmount)}</p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mt-2">
                <div className="bg-light-success h-4 rounded-full" style={{ width: `${progress}%` }}></div>
              </div>
              {goal.deadline && <p className="text-sm text-light-secondary dark:text-dark-secondary mt-2">Deadline: {new Date(goal.deadline).toLocaleDateString()}</p>}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default GoalsPage;
