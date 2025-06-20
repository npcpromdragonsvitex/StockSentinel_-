import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { format } from 'date-fns';
import { usePortfolioHistory } from '@/hooks/usePortfolio';
import { Skeleton } from '@/components/ui/skeleton';

interface PortfolioChartProps {
  portfolioId: number;
  selectedPeriod: '7D' | '1M' | '3M' | '1Y';
}

export function PortfolioChart({ portfolioId, selectedPeriod }: PortfolioChartProps) {
  const days = selectedPeriod === '7D' ? 7 : selectedPeriod === '1M' ? 30 : selectedPeriod === '3M' ? 90 : 365;
  const { data: historyData, isLoading, error } = usePortfolioHistory(portfolioId, days);

  if (isLoading) {
    return <Skeleton className="w-full h-64" />;
  }

  // Если есть ошибка, показываем сообщение но с fallback данными для демонстрации
  if (error) {
    console.error('Portfolio history error:', error);
  }

  // Используем реальные данные из API
  if (!historyData || historyData.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-slate-400">
        <div className="text-center">
          <p className="text-sm">Данные недоступны</p>
          <p className="text-xs mt-1">Проверьте подключение к API</p>
        </div>
      </div>
    );
  }

  const chartData = historyData.map(point => ({
    timestamp: format(new Date(point.timestamp), selectedPeriod === '7D' ? 'HH:mm' : 'dd.MM'),
    value: point.value,
    formattedValue: point.value.toLocaleString('ru-RU', { minimumFractionDigits: 0 })
  }));

  const minValue = Math.min(...chartData.map(d => d.value));
  const maxValue = Math.max(...chartData.map(d => d.value));
  const padding = (maxValue - minValue) * 0.1;

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="timestamp" 
            stroke="#9CA3AF"
            fontSize={12}
          />
          <YAxis 
            stroke="#9CA3AF"
            fontSize={12}
            domain={[minValue - padding, maxValue + padding]}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1E293B',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#F8FAFC'
            }}
            formatter={(value: number) => [
              `${value.toLocaleString('ru-RU')} ₽`,
              'Стоимость портфеля'
            ]}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={false}
            fill="url(#colorGradient)"
          />
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
            </linearGradient>
          </defs>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
