import React from 'react';
import { Bar } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';

const IncomeExpenseChart = ({ data }) => {
  const { theme } = useTheme();
  const { formatCurrency } = useCurrency();

  const chartData = {
    labels: ['Last Month'],
    datasets: [
      {
        label: 'Income',
        data: [data.income],
        backgroundColor: theme === 'light' ? '#10B981' : '#34D399',
      },
      {
        label: 'Expense',
        data: [data.expense],
        backgroundColor: theme === 'light' ? '#EF4444' : '#F87171',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
            color: theme === 'light' ? '#1F2937' : '#F9FAFB',
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += formatCurrency(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: theme === 'light' ? '#374151' : '#9CA3AF',
        },
      },
      y: {
        ticks: {
          color: theme === 'light' ? '#374151' : '#9CA3AF',
          callback: function(value) {
            return formatCurrency(value);
          }
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export default IncomeExpenseChart;
