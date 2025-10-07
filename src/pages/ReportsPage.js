import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from '../utils/axios';
import Card from '../components/Card';
import { useCurrency } from '../context/CurrencyContext';
import PieChart from '../components/charts/PieChart';
import IncomeExpenseChart from '../components/charts/IncomeExpenseChart';
import CumulativeSavingsChart from '../components/charts/CumulativeSavingsChart';
import TopSpendingCategoriesChart from '../components/charts/TopSpendingCategoriesChart';

const ReportCard = ({ title, value, format, colorClass = '' }) => (
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

const ReportsPage = () => {
  const { formatCurrency } = useCurrency();
  const [reportsData, setReportsData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  const fetchReportsData = useCallback(async (abortController) => {
    setError(null);
    setLoading(true);
    try {
      const { data: res } = await axios.get('/transactions/reports', { signal: abortController.signal });
      if (isMounted.current) {
        setReportsData(res.data);
      }
    } catch (err) {
      if (axios.isCancel(err)) {
        console.log('Request canceled', err.message);
        return;
      }
      if (isMounted.current) {
        setError('Failed to fetch reports data. Please try again later.');
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
    fetchReportsData(abortController);

    return () => {
      isMounted.current = false;
      abortController.abort();
    };
  }, [fetchReportsData]);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <h1 className="text-3xl font-bold">Reports</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card><ChartSkeleton /></Card>
          <Card><ChartSkeleton /></Card>
          <Card><ChartSkeleton /></Card>
          <Card><ChartSkeleton /></Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Reports</h1>
            <Card className="bg-light-error/20 border-light-error/50">
                <div className="flex justify-between items-center">
                    <p className="text-light-error font-medium">{error}</p>
                    <button onClick={() => fetchReportsData(new AbortController())} className="bg-light-error text-white px-4 py-2 rounded-md hover:opacity-90">Retry</button>
                </div>
            </Card>
        </div>
    );
  }

  const spendingBreakdownData = reportsData?.spendingBreakdown.length > 0 ? {
    labels: reportsData.spendingBreakdown.map(c => c._id),
    values: reportsData.spendingBreakdown.map(c => c.total),
  } : null;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Reports</h1>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Last Month's Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ReportCard title="Total Income" value={reportsData?.summary.income} format={formatCurrency} colorClass="text-light-success dark:text-dark-success" />
            <ReportCard title="Total Expenses" value={reportsData?.summary.expenses} format={formatCurrency} colorClass="text-light-error dark:text-dark-error" />
            <ReportCard title="Net Savings" value={reportsData?.summary.net} format={formatCurrency} colorClass="text-light-accent dark:text-dark-accent" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
            <h2 className="text-lg font-medium mb-4">Spending Breakdown (Last Month)</h2>
            <div className="h-80 flex items-center justify-center">
                {spendingBreakdownData ? <PieChart data={spendingBreakdownData} /> : <p>No spending data for last month.</p>}
            </div>
        </Card>
        <Card>
            <h2 className="text-lg font-medium mb-4">Income vs Expense (Last Month)</h2>
            <div className="h-80">
                {reportsData?.incomeVsExpense ? <IncomeExpenseChart data={reportsData.incomeVsExpense} /> : <p>No data available.</p>}
            </div>
        </Card>
        <Card>
            <h2 className="text-lg font-medium mb-4">Cumulative Savings Trend (Last 6 Months)</h2>
            <div className="h-80">
                {reportsData?.cumulativeSavings && reportsData.cumulativeSavings.labels.length > 0 ? <CumulativeSavingsChart data={reportsData.cumulativeSavings} /> : <p>No savings data available.</p>}
            </div>
        </Card>
        <Card>
            <h2 className="text-lg font-medium mb-4">Top 3 Spending Categories (Last Month)</h2>
            <div className="h-80">
                {reportsData?.topCategories && reportsData.topCategories.length > 0 ? <TopSpendingCategoriesChart data={reportsData.topCategories} /> : <p>No spending data for last month.</p>}
            </div>
        </Card>
      </div>
    </div>
  );
};

export default ReportsPage;
