import React, { useState, useEffect, useCallback } from 'react';
import axios from '../utils/axios';
import { useNotification } from '../context/NotificationContext';
import Card from '../components/Card';
import { Bar } from 'react-chartjs-2';
import { useTheme } from '../context/ThemeContext';

const ReportsPage = () => {
  const { showNotification } = useNotification();
  const { theme } = useTheme();
  const [spendingData, setSpendingData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    try {
      const res = await axios.get('/transactions/spending-breakdown?period=monthly');
      const latestReport = res.data.data[res.data.data.length - 1];
      if (latestReport) {
        const chartColors = theme === 'light' ? 
          { bg: '#2563EB' } : 
          { bg: '#3B82F6' };
        setSpendingData({
          labels: latestReport.categories.map(c => c.category),
          datasets: [{
            label: 'Spending by Category',
            data: latestReport.categories.map(c => c.amount),
            backgroundColor: chartColors.bg,
          }]
        });
      }
    } catch (err) {
      showNotification('Failed to fetch report data', 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification, theme]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  if (loading) return <div>Loading reports...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Reports</h1>
      <Card>
        <h2 className="text-xl font-bold mb-4">Spending Breakdown (Last Month)</h2>
        {spendingData ? (
          <Bar data={spendingData} options={{ plugins: { legend: { labels: { color: theme === 'light' ? '#1F2937' : '#F9FAFB' } } }, scales: { x: { ticks: { color: theme === 'light' ? '#374151' : '#9CA3AF' } }, y: { ticks: { color: theme === 'light' ? '#374151' : '#9CA3AF' } } } }} />
        ) : (
          <p>No spending data available for the last month.</p>
        )}
      </Card>
    </div>
  );
};

export default ReportsPage;