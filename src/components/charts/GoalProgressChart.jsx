import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const GoalProgressChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="actual" fill="#8884d8" name="Actual Progress" />
        <Bar dataKey="expected" fill="#82ca9d" name="Expected Progress" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default GoalProgressChart;