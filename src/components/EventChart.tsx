import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { EventAnalytics } from '../types/database';

interface EventChartProps {
  data: EventAnalytics[];
}

export const EventChart: React.FC<EventChartProps> = ({ data }) => {
  const chartData = React.useMemo(() => {
    // Recharts expects an array of objects for the LineChart data prop.
    // The given data format is suitable for a simple chart where each item represents an event type.
    return data.map(item => ({
      name: item.eventType,
      count: item.count,
    }));
  }, [data]);

  const color = '#3a74e8'; // A modern, soft purple color for the line

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <p className="font-semibold text-gray-900">{`Event: ${label}`}</p>
          <p className="text-sm text-gray-600">{`Count: ${payload[0].value}`}</p>
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
              dataKey="name"
              axisLine={false}
              tickLine={false}
              padding={{ left: 20, right: 20 }}
              style={{ fontSize: '12px' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<CustomTooltip />} />
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