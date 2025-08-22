import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Reports = () => {
  const [reportData, setReportData] = useState({
    monthlyTotals: [],
    categoryTotals: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only use sample data for now
    const sampleData = {
      monthlyTotals: [
        { month: 'August 2023', income: 5000, expenses: 3000, savings: 2000 },
        { month: 'July 2023', income: 4800, expenses: 2800, savings: 2000 },
        { month: 'June 2023', income: 5200, expenses: 3200, savings: 2000 }
      ],
      categoryTotals: [
        { name: 'Salary', type: 'income', total: 15000, percentage: 100 },
        { name: 'Rent', type: 'expense', total: 3000, percentage: 33 },
        { name: 'Groceries', type: 'expense', total: 1500, percentage: 17 },
        { name: 'Utilities', type: 'expense', total: 1000, percentage: 11 }
      ]
    };

    // Simulate loading delay
    setTimeout(() => {
      setReportData(sampleData);
      setIsLoading(false);
    }, 500);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Financial Reports</h1>

      {/* Monthly Overview */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Monthly Overview</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Income</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expenses</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Savings</th>
              </tr>
            </thead>
            <tbody>
              {reportData.monthlyTotals.map((month, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{month.month}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-green-600">${month.income.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-red-600">${month.expenses.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={month.savings >= 0 ? 'text-green-600' : 'text-red-600'}>
                      ${month.savings.toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Analysis */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Category Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportData.categoryTotals.map((category, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <h3 className="font-medium text-gray-700">{category.name}</h3>
              <p className={`text-xl font-semibold ${
                category.type === 'income' ? 'text-green-600' : 'text-red-600'
              }`}>
                ${Math.abs(category.total).toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">{category.percentage}% of total {category.type}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;