'use client';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ReportsPerClientBarChartProps {
  reportsPerClient: { client_name: string; report_count: number }[];
}

const ReportsPerClient: React.FC<ReportsPerClientBarChartProps> = ({ reportsPerClient }) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={reportsPerClient} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="client_name" label={{ value: 'Client Name', position: 'insideBottomRight', offset: -10 }} />
        <YAxis label={{ value: 'Number of Reports', angle: -90, position: 'insideLeft' }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="report_count" fill="#8884d8" name="Report Count"/>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ReportsPerClient;
