'use client'
import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface VulnerabilityLineChartProps {
  responseData: any[];
}

const VulnerabilityLineChart: React.FC<VulnerabilityLineChartProps> = ({ responseData }) => {
  const [data, setData] = useState<{ name: string; high: number; medium: number; low: number }[]>([]);

  useEffect(() => {
    const lineChartData: { name: string; high: number; medium: number; low: number }[] = [];
  
    const reversedResponseData = [...responseData].reverse(); // Clone and reverse the data
  
    for (let i = 0; i < reversedResponseData.length; i++) {
      const report = reversedResponseData[i];
      const vulnerabilities = report.content.finalReport; 
      const high = vulnerabilities.filter((vuln: any) => vuln.Severity === 'High').length;
      const medium = vulnerabilities.filter((vuln: any) => vuln.Severity === 'Medium').length;
      const low = vulnerabilities.filter((vuln: any) => vuln.Severity === 'Low').length;
  
      lineChartData.push({ name: `Report ${i + 1}`, high, medium, low });
    }
  
    setData(lineChartData);
  }, [responseData]);
  

  
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" label={{ value: 'Report Number', position: 'insideBottomRight', offset: -10 }} />
        <YAxis label={{ value: 'Number of vulnerabilities', angle: -90, position: 'insideLeft' }} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="high" stroke="#ff8c00" name="High" />
        <Line type="monotone" dataKey="medium" stroke="#ffd700" name="Medium" />
        <Line type="monotone" dataKey="low" stroke="#32cd32" name="Low" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default VulnerabilityLineChart;
