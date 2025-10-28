// components/dashboard/MonthlyChart.tsx
'use client';

import { MonthlySummary } from '@/lib/types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface MonthlyChartProps {
  data: MonthlySummary[];
}

export default function MonthlyChart({ data }: MonthlyChartProps) {
  // データを整形
  const chartData = data.map(item => ({
    month: item.month.split('-')[1] + '月',
    収入: item.income,
    支出: item.expense,
    バランス: item.balance,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="month" 
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
          tickFormatter={(value) => `¥${(value / 1000).toFixed(0)}K`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          }}
          formatter={(value: number) => formatCurrency(value)}
        />
        <Legend 
          wrapperStyle={{ fontSize: '14px' }}
          iconType="line"
        />
        <Line
          type="monotone"
          dataKey="収入"
          stroke="#10b981"
          strokeWidth={2}
          dot={{ fill: '#10b981', r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="支出"
          stroke="#ef4444"
          strokeWidth={2}
          dot={{ fill: '#ef4444', r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="バランス"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ fill: '#3b82f6', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}