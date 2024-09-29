'use client'
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLOURS = ['#ff8c00', '#ffd700', '#32cd32'];

interface SeverityDistributionProps {
    data: { name: string; value: number }[];
}

const SeverityDistribution: React.FC<SeverityDistributionProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLOURS[index % COLOURS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default SeverityDistribution;
