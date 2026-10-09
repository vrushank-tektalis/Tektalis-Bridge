import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Card from '../common/Card';

const AreaChartWidget = ({ title, data, areas, xKey, height = 300 }) => {
  return (
    <Card title={title}>
      <div style={{ height: height, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              {areas.map((area, idx) => (
                <linearGradient key={`color-${idx}`} id={`color-${area.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={area.color} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={area.color} stopOpacity={0}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis dataKey={xKey} axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            {areas.map((area, idx) => (
              <Area 
                key={idx} 
                type="monotone" 
                dataKey={area.dataKey} 
                name={area.name} 
                stroke={area.color} 
                fillOpacity={1} 
                fill={`url(#color-${area.dataKey})`} 
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default AreaChartWidget;
