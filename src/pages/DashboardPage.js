import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from '../utils/axios';
import Card from '../components/Card';
import { Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

const DashboardCard = ({ title, value, format, colorClass = '' }) => (
  <Card>
    <h2 className="text-sm font-medium text-light-secondary dark:text-dark-secondary">{title}</h2>
    <p className={`mt-1 text-3xl font-semibold ${colorClass}`}>{format(value)}</p>
  </Card>
);

const SkeletonCard = () => (
  <Card>
    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
    <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
  </Card>
);

const DashboardPage = () => {
  const { theme } = useTheme();
  const { formatCurrency } = useCurrency();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  const fetchDashboardData = useCallback(async (abortController) => {
    setError(null);
    setLoading(true);
    try {
      const { data: res } = await axios.get('/dashboard/summary', { signal: abortController.signal });
      if (isMounted.current) {
        setSummary(res.data);
      }
    } catch (err) {
      if (axios.isCancel(err)) {
        console.log('Request canceled', err.message);
        return;
      }
      if (isMounted.current) {
        setError('Failed to fetch dashboard data. Please try again later.');
        setSummary({ totalBalance: 0, totalIncome: 0, totalExpenses: 0, totalSavings: 0, monthlySummary: { labels: [], incomeData: [], expenseData: [] }, categorySpending: [] });
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    const abortController = new AbortController();
    fetchDashboardData(abortController);

    return () => {
      isMounted.current = false;
      abortController.abort();
    };
  }, [fetchDashboardData]);

  const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: theme === 'light' ? '#1F2937' : '#F9FAFB' } } }, scales: { x: { ticks: { color: theme === 'light' ? '#374151' : '#9CA3AF' } }, y: { ticks: { color: theme === 'light' ? '#374151' : '#9CA3AF' } } } };
  const lineChartColors = theme === 'light' ? { income: '#10B981', expense: '#EF4444' } : { income: '#34D399', expense: '#F87171' };

  const lineChartData = summary ? {
    labels: summary.monthlySummary.labels,
    datasets: [
      { label: 'Income', data: summary.monthlySummary.incomeData, borderColor: lineChartColors.income, backgroundColor: `${lineChartColors.income}80` },
      { label: 'Expenses', data: summary.monthlySummary.expenseData, borderColor: lineChartColors.expense, backgroundColor: `${lineChartColors.expense}80` },
    ],
  } : { labels: [], datasets: [] };

  const pieChartData = summary && summary.categorySpending.length > 0 ? {
    labels: summary.categorySpending.map(c => c.category),
    datasets: [{
        data: summary.categorySpending.map(c => c.total),
        backgroundColor: ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#6366F1'],
        hoverBackgroundColor: ['#2563EB', '#7C3AED', '#DB2777', '#D97706', '#059669', '#4F46E5']
    }]
  } : null;

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3"><Card><div className="h-80 bg-gray-300 dark:bg-gray-700 rounded"></div></Card></div>
          <div className="lg:col-span-2"><Card><div className="h-80 bg-gray-300 dark:bg-gray-700 rounded"></div></Card></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      {error && (
        <Card className="bg-light-error/20 border-light-error/50">
          <div className="flex justify-between items-center">
            <p className="text-light-error font-medium">{error}</p>
            <button onClick={() => fetchDashboardData(new AbortController())} className="bg-light-error text-white px-4 py-2 rounded-md hover:opacity-90">Retry</button>
          </div>
        </Card>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard title="Total Balance" value={summary?.totalBalance} format={formatCurrency} />
        <DashboardCard title="Total Income" value={summary?.totalIncome} format={formatCurrency} colorClass="text-light-success dark:text-dark-success" />
        <DashboardCard title="Total Expenses" value={summary?.totalExpenses} format={formatCurrency} colorClass="text-light-error dark:text-dark-error" />
        <DashboardCard title="Total Savings" value={summary?.totalSavings} format={formatCurrency} colorClass="text-light-accent dark:text-dark-accent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
            <Card>
                <h2 className="text-lg font-medium mb-4">Monthly Income vs. Expense</h2>
                <div className="h-80">
                    {summary && summary.monthlySummary.labels.length > 0 ? <Line data={lineChartData} options={chartOptions} /> : <p className="flex items-center justify-center h-full">No monthly data available.</p>}
                </div>
            </Card>
        </div>
        <div className="lg:col-span-2">
            <Card>
                <h2 className="text-lg font-medium mb-4">Spending by Category</h2>
                <div className="h-80 flex items-center justify-center">
                    {pieChartData ? <Pie data={pieChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: theme === 'light' ? '#1F2937' : '#F9FAFB' } } } }} /> : <p>No expense data for chart.</p>}
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
