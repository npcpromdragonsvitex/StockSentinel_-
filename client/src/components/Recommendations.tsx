import { usePortfolioRecommendations } from '@/hooks/usePortfolio';
import { Lightbulb } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface RecommendationsProps {
  portfolioId: number;
}

export function Recommendations({ portfolioId }: RecommendationsProps) {
  const { data: recommendations, isLoading } = usePortfolioRecommendations(portfolioId);

  // Mock recommendations for demo purposes when API data is not available
  const mockRecommendations = [
    {
      id: 1,
      type: 'BUY' as const,
      title: 'Увеличить позицию в SBER',
      description: 'Целевая цена: 285-290 ₽. Текущий уровень поддержки на 265 ₽ даёт хорошую точку входа.',
      riskLevel: 'LOW' as const,
      potential: '+8-12%'
    },
    {
      id: 2,
      type: 'SELL' as const,
      title: 'Зафиксировать прибыль MGNT',
      description: 'Акция достигла целевого уровня 5700 ₽. Рекомендуется продать 50% позиции.',
      riskLevel: 'MEDIUM' as const,
      potential: 'Фиксация: +15%'
    },
    {
      id: 3,
      type: 'STRATEGY' as const,
      title: 'Диверсификация портфеля',
      description: 'Рассмотрите добавление ROSN и NVTK для снижения концентрационного риска.',
      riskLevel: 'HIGH' as const,
      potential: 'Срок: 1-2 недели'
    }
  ];

  const displayRecommendations = recommendations && recommendations.length > 0 
    ? recommendations 
    : mockRecommendations;

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'BUY':
        return 'border-green-500';
      case 'SELL':
        return 'border-amber-500';
      case 'STRATEGY':
        return 'border-blue-500';
      default:
        return 'border-slate-500';
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'BUY':
        return <Badge className="bg-green-900 text-green-400">ПОКУПКА</Badge>;
      case 'SELL':
        return <Badge className="bg-amber-900 text-amber-400">ПРОДАЖА</Badge>;
      case 'STRATEGY':
        return <Badge className="bg-blue-900 text-blue-400">СТРАТЕГИЯ</Badge>;
      default:
        return <Badge className="bg-slate-900 text-slate-400">УДЕРЖАНИЕ</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-slate-850 rounded-xl p-6 border border-slate-800">
        <div className="flex items-center mb-6">
          <Skeleton className="w-6 h-6 mr-3" />
          <Skeleton className="w-48 h-6" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="w-full h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-850 rounded-xl p-6 border border-slate-800">
      <h3 className="text-lg font-semibold mb-6 flex items-center">
        <Lightbulb className="text-amber-500 mr-3 h-5 w-5" />
        Рекомендации по инвестированию
      </h3>
      <div className="space-y-4">
        {displayRecommendations.map((rec) => (
          <div
            key={rec.id}
            className={`bg-slate-800 rounded-lg p-4 border-l-4 ${getBorderColor(rec.type)}`}
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-white">{rec.title}</h4>
              {getTypeBadge(rec.type)}
            </div>
            <p className="text-sm text-slate-300 mb-3">{rec.description}</p>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Риск: {rec.riskLevel === 'LOW' ? 'Низкий' : rec.riskLevel === 'MEDIUM' ? 'Средний' : 'Высокий'}</span>
              <span>{rec.potential}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
