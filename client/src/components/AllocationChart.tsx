import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { PortfolioWithPositions } from '@shared/schema';

interface AllocationChartProps {
  portfolio: PortfolioWithPositions;
}

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#6B7280', '#EF4444', '#14B8A6'];

export function AllocationChart({ portfolio }: AllocationChartProps) {
  const totalValue = parseFloat(portfolio.totalValue);
  
  const allocationData = portfolio.positions.map((position, index) => {
    const value = parseFloat(position.currentValue);
    const percentage = (value / totalValue) * 100;
    
    return {
      name: position.stock.ticker,
      value: percentage,
      absoluteValue: value,
      color: COLORS[index % COLORS.length]
    };
  });

  // Add cash allocation if available
  const availableCash = parseFloat(portfolio.availableCash);
  if (availableCash > 0) {
    const cashPercentage = (availableCash / totalValue) * 100;
    allocationData.push({
      name: 'Денежные средства',
      value: cashPercentage,
      absoluteValue: availableCash,
      color: COLORS[allocationData.length % COLORS.length]
    });
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{data.name}</p>
          <p className="text-blue-400">{data.value.toFixed(1)}%</p>
          <p className="text-slate-300 text-sm">
            {data.absoluteValue.toLocaleString('ru-RU')} ₽
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-48">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={allocationData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
          >
            {allocationData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
