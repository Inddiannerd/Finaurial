import React from 'react';
import { Line } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';

const CumulativeSavingsChart = ({ data }) => {
  const { theme } = useTheme();

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Cumulative Savings',
        data: data.values,
        fill: true,
        backgroundColor: theme === 'light' ? 'rgba(20, 184, 166, 0.2)' : 'rgba(20, 184, 166, 0.4)',
        borderColor: '#14B8A6',
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
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
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export default CumulativeSavingsChart;
