import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrafficSource } from '../types/database';

interface TrafficSourcesChartProps {
  data: TrafficSource[];
}

export const TrafficSourcesChart: React.FC<TrafficSourcesChartProps> = ({ data }) => {
  const chartData = data.slice(0, 10).map(source => ({
    name: source.utm_source,
    medium: source.utm_medium || 'N/A',
    campaign: source.utm_campaign || 'N/A',
    count: source.count,
    label: `${source.utm_source}${source.utm_medium ? ` (${source.utm_medium})` : ''}`
  }));

  const color = '#3B82F6'; // A modern blue color for the line

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <p className="font-semibold text-gray-900">{`Source: ${label}`}</p>
          <p className="text-sm text-gray-600">{`Visits: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              padding={{ left: 20, right: 20 }}
              style={{ fontSize: '12px' }}
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="count"
              stroke={color}
              strokeWidth={3}
              dot={{ stroke: color, strokeWidth: 2, r: 4, fill: '#fff' }}
              activeDot={{ r: 6, fill: color, stroke: '#fff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};