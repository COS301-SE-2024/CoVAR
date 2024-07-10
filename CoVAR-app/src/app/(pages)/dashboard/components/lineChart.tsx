'use client'
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const VulnerabilityLineChart: React.FC = () => {
  const data = [
    { name: '1', critical: 10, high: 5, medium: 10, low: 20 },
    { name: '2', critical: 9, high: 4, medium: 5, low: 12 },
    { name: '3', critical: 8, high: 4, medium: 5, low: 11 },
    { name: '4', critical: 7, high: 4, medium: 5, low: 9 },
    { name: '5', critical: 6, high: 4, medium: 5, low: 1 },
    { name: '6', critical: 5, high: 4, medium: 5, low: 1 },
    { name: '7', critical: 2, high: 4, medium: 5, low: 0 },
  ];

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" label={{ value: 'Report Number', position: 'insideBottomRight', offset: -10 }} />
        <YAxis label={{ value: 'Number of vulnerabilities', angle: -90, position: 'insideLeft' }} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="critical" stroke="#ff0000" name="Critical" />
        <Line type="monotone" dataKey="high" stroke="#ffa500" name="High" />
        <Line type="monotone" dataKey="medium" stroke="#82ca9d" name="Medium" />
        <Line type="monotone" dataKey="low" stroke="#8884d8" name="Low" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default VulnerabilityLineChart;
