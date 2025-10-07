import React from 'react';
import { Pie } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';

const chartColors = [
  '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#6366F1',
  '#2563EB', '#7C3AED', '#DB2777', '#D97706', '#059669', '#4F46E5'
];

const PieChart = ({ data }) => {
  const { theme } = useTheme();

  const chartData = {
    labels: data.labels,
    datasets: [{
        data: data.values,
        backgroundColor: chartColors,
        hoverBackgroundColor: chartColors,
    }]
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
  };

  return <Pie data={chartData} options={options} />;
};

export default PieChart;
