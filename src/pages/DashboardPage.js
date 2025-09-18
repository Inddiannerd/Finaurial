import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from '../utils/axios';
import Card from '../components/Card';
import { Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler, BarElement } from 'chart.js';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';
import CumulativeSavingsChart from '../components/charts/CumulativeSavingsChart';
import MonthlyExpensesChart from '../components/charts/MonthlyExpensesChart';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler, BarElement);

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

const ChartSkeleton = () => (
    <div className="h-80 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
);

const DashboardPage = () => {
  const { theme } = useTheme();
  const { formatCurrency } = useCurrency();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  const [showMore, setShowMore] = useState(false);
  const [chartsToShow, setChartsToShow] = useState({});
  const [loadingMore, setLoadingMore] = useState(false);
  const [savingsData, setSavingsData] = useState(null);
  const [expensesData, setExpensesData] = useState(null);
  const [moreChartsError, setMoreChartsError] = useState(null);

  useEffect(() => {
    const savedShowMore = localStorage.getItem('dashboardShowMore');
    if (savedShowMore) {
      setShowMore(JSON.parse(savedShowMore));
    }
    const savedChartsToShow = localStorage.getItem('dashboardChartsToShow');
    if (savedChartsToShow) {
      setChartsToShow(JSON.parse(savedChartsToShow));
    }
  }, []);

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

  const fetchMoreChartsData = useCallback(async () => {
    if (!showMore || !Object.values(chartsToShow).some(v => v)) return;

    setLoadingMore(true);
    setMoreChartsError(null);

    try {
        const requests = [];
        if (chartsToShow.cumulativeSavings) {
            requests.push(axios.get('/dashboard/cumulative-savings'));
        } else {
            requests.push(Promise.resolve(null));
        }
        if (chartsToShow.monthlyExpenses) {
            requests.push(axios.get('/dashboard/monthly-category-expenses'));
        } else {
            requests.push(Promise.resolve(null));
        }

        const [savingsRes, expensesRes] = await Promise.all(requests);

        if (isMounted.current) {
            if (savingsRes) setSavingsData(savingsRes.data.data);
            if (expensesRes) setExpensesData(expensesRes.data.data);
        }
    } catch (err) {
        if (isMounted.current) {
            setMoreChartsError('Failed to load additional charts.');
            console.error('Error fetching more charts:', err.response?.data?.detail || err.message);
        }
    } finally {
        if (isMounted.current) {
            setLoadingMore(false);
        }
    }
  }, [showMore, chartsToShow]);

  useEffect(() => {
    fetchMoreChartsData();
  }, [fetchMoreChartsData]);

  const handleShowMoreToggle = () => {
    const newShowMore = !showMore;
    setShowMore(newShowMore);
    localStorage.setItem('dashboardShowMore', JSON.stringify(newShowMore));
  };

  const handleChartToggle = (chartName) => {
    const newChartsToShow = { ...chartsToShow, [chartName]: !chartsToShow[chartName] };
    setChartsToShow(newChartsToShow);
    localStorage.setItem('dashboardChartsToShow', JSON.stringify(newChartsToShow));
  };

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

      <div className="text-center">
        <button onClick={handleShowMoreToggle} className="text-light-accent dark:text-dark-accent font-semibold" aria-expanded={showMore}>
          {showMore ? 'Show less' : 'Show more'}
        </button>
      </div>

      {showMore && (
        <div className="space-y-6">
            <div className="flex items-center justify-center space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={!!chartsToShow.cumulativeSavings} onChange={() => handleChartToggle('cumulativeSavings')} className="form-checkbox" />
                    <span>Cumulative Savings</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={!!chartsToShow.monthlyExpenses} onChange={() => handleChartToggle('monthlyExpenses')} className="form-checkbox" />
                    <span>Monthly Expenses by Category</span>
                </label>
            </div>

            {moreChartsError && (
                <Card className="bg-light-error/20 border-light-error/50 text-center">
                    <p className="text-light-error font-medium">{moreChartsError}</p>
                    <button onClick={fetchMoreChartsData} className="mt-2 text-sm underline">Retry</button>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {chartsToShow.cumulativeSavings && (
                    <Card>
                        <h2 className="text-lg font-medium mb-4">Cumulative Savings Growth</h2>
                        <div className="h-80">
                            {loadingMore ? <ChartSkeleton /> : savingsData && savingsData.labels.length > 0 ? <CumulativeSavingsChart data={savingsData} /> : <p className="flex items-center justify-center h-full">No savings data available.</p>}
                        </div>
                    </Card>
                )}
                {chartsToShow.monthlyExpenses && (
                    <Card>
                        <h2 className="text-lg font-medium mb-4">Category-wise Monthly Expenses</h2>
                        <div className="h-80">
                            {loadingMore ? <ChartSkeleton /> : expensesData && expensesData.labels.length > 0 ? <MonthlyExpensesChart data={expensesData} /> : <p className="flex items-center justify-center h-full">No expense data for chart.</p>}
                        </div>
                    </Card>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
