import React from 'react';
import { Bar } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';

const TopSpendingCategoriesChart = ({ data }) => {
  const { theme } = useTheme();
  const { formatCurrency } = useCurrency();

  const chartData = {
    labels: data.map(d => d._id),
    datasets: [
      {
        label: 'Spending',
        data: data.map(d => d.total),
        backgroundColor: ['#3B82F6', '#8B5CF6', '#EC4899'],
      },
    ],
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.x !== null) {
              label += formatCurrency(context.parsed.x);
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
          callback: function(value) {
            return formatCurrency(value);
          }
        },
      },
      y: {
        ticks: {
          color: theme === 'light' ? '#374151' : '#9CA3AF',
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export default TopSpendingCategoriesChart;
