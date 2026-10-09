import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Card from '../common/Card';

const LineChartWidget = ({ title, data, lines, xKey, height = 300 }) => {
  return (
    <Card title={title}>
      <div style={{ height: height, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis dataKey={xKey} axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            {lines.map((line, idx) => (
              <Line 
                key={idx} 
                type="monotone" 
                dataKey={line.dataKey} 
                name={line.name} 
                stroke={line.color} 
                strokeWidth={2} 
                dot={{ r: 4, strokeWidth: 2 }} 
                activeDot={{ r: 6 }} 
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default LineChartWidget;
