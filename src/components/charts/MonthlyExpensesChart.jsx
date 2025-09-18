import React from 'react';
import { Bar } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';

const chartColors = [
  '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#6366F1',
  '#2563EB', '#7C3AED', '#DB2777', '#D97706', '#059669', '#4F46E5'
];

const MonthlyExpensesChart = ({ data }) => {
  const { theme } = useTheme();

  const chartData = {
    labels: data.labels,
    datasets: data.datasets.map((dataset, index) => ({
      ...dataset,
      backgroundColor: chartColors[index % chartColors.length],
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: theme === 'light' ? '#1F2937' : '#F9FAFB',
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        ticks: {
          color: theme === 'light' ? '#374151' : '#9CA3AF',
        },
      },
      y: {
        stacked: true,
        ticks: {
          color: theme === 'light' ? '#374151' : '#9CA3AF',
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export default MonthlyExpensesChart;
