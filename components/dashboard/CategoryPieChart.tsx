// components/dashboard/CategoryPieChart.tsx
'use client';

import { CategorySummary } from '@/lib/types';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface CategoryPieChartProps {
  data: CategorySummary[];
}

export default function CategoryPieChart({ data }: CategoryPieChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        データがありません
      </div>
    );
  }

  // データを整形
  const chartData = data.map(item => ({
    name: item.category_name,
    value: item.total,
    color: item.color,
  }));

  // 合計金額を計算
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => 
              `${name} ${(percent * 100).toFixed(0)}%`
            }
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
            formatter={(value: number) => formatCurrency(value)}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* カテゴリリスト */}
      <div className="space-y-2">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-700">{item.name}</span>
            </div>
            <div className="text-right">
              <span className="font-medium text-gray-900">
                {formatCurrency(item.value)}
              </span>
              <span className="text-gray-500 ml-2">
                ({((item.value / total) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}