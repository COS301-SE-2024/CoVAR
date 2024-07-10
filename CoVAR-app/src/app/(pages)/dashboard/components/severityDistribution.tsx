import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const pieData = [
  { name: 'Critical', value: 40 },
  { name: 'High', value: 30 },
  { name: 'Medium', value: 20 },
  { name: 'Low', value: 10 },
];

const COLOURS = ['#ff0000', '#ffa500', '#82ca9d', '#8884d8'];

const SeverityDistribution: React.FC = () => {
  return (

        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLOURS[index % COLOURS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>

  );
};

export default SeverityDistribution;
