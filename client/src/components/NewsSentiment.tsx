import { Progress } from '@/components/ui/progress';
import { Newspaper, Plus, Minus } from 'lucide-react';
import type { PortfolioWithPositions } from '@shared/schema';

interface NewsSentimentProps {
  portfolio: PortfolioWithPositions;
}

export function NewsSentiment({ portfolio }: NewsSentimentProps) {
  // Mock sentiment data since we don't have real news sentiment API yet
  const mockSentimentData = [
    {
      ticker: 'SBER',
      sentiment: 75,
      bullishPoints: [
        'Рост кредитного портфеля на 12% г/г',
        'Увеличение дивидендных выплат'
      ],
      bearishPoints: [
        'Возможное ужесточение регулирования'
      ]
    },
    {
      ticker: 'GAZP',
      sentiment: 45,
      bullishPoints: [
        'Высокие цены на газ в Европе'
      ],
      bearishPoints: [
        'Геополитические риски',
        'Снижение экспортных объёмов'
      ]
    }
  ];

  const getStockIcon = (ticker: string) => {
    const colorMap: Record<string, string> = {
      'SBER': 'bg-green-600',
      'LKOH': 'bg-blue-600',
      'MGNT': 'bg-purple-600',
      'GAZP': 'bg-amber-600',
      'ROSN': 'bg-red-600',
      'NVTK': 'bg-cyan-600',
    };
    
    return colorMap[ticker] || 'bg-slate-600';
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 70) return 'text-green-500';
    if (sentiment >= 50) return 'text-amber-500';
    return 'text-red-500';
  };

  const getProgressColor = (sentiment: number) => {
    if (sentiment >= 70) return 'bg-green-500';
    if (sentiment >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const overallSentiment = mockSentimentData.reduce((acc, item) => acc + item.sentiment, 0) / mockSentimentData.length;

  return (
    <div className="bg-slate-850 rounded-xl p-6 border border-slate-800">
      <h3 className="text-lg font-semibold mb-6 flex items-center">
        <Newspaper className="text-blue-500 mr-3 h-5 w-5" />
        Анализ новостей и настроений
      </h3>
      <div className="space-y-4">
        {mockSentimentData.map((item) => (
          <div key={item.ticker} className="bg-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className={`w-8 h-8 ${getStockIcon(item.ticker)} rounded-full flex items-center justify-center mr-3`}>
                  <span className="text-white text-xs font-bold">
                    {item.ticker.substring(0, 2)}
                  </span>
                </div>
                <span className="font-medium text-white">{item.ticker}</span>
              </div>
              <div className="flex items-center">
                <div className="w-16 bg-slate-700 rounded-full h-2 mr-2">
                  <div 
                    className={`h-2 rounded-full ${getProgressColor(item.sentiment)}`}
                    style={{ width: `${item.sentiment}%` }}
                  />
                </div>
                <span className={`text-sm font-medium ${getSentimentColor(item.sentiment)}`}>
                  {item.sentiment}%
                </span>
              </div>
            </div>
            <div className="space-y-2">
              {item.bullishPoints.map((point, index) => (
                <div key={`bullish-${index}`} className="text-sm text-slate-300 flex items-start">
                  <Plus className="text-green-500 mr-2 h-4 w-4 mt-0.5 flex-shrink-0" />
                  {point}
                </div>
              ))}
              {item.bearishPoints.map((point, index) => (
                <div key={`bearish-${index}`} className="text-sm text-slate-300 flex items-start">
                  <Minus className="text-red-500 mr-2 h-4 w-4 mt-0.5 flex-shrink-0" />
                  {point}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-slate-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Общий индекс настроений</span>
          <span className={`font-medium ${getSentimentColor(overallSentiment)}`}>
            {overallSentiment >= 70 ? 'Позитивный' : overallSentiment >= 50 ? 'Нейтральный' : 'Негативный'} ({Math.round(overallSentiment)}%)
          </span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
          <div 
            className={`h-2 rounded-full bg-gradient-to-r ${overallSentiment >= 70 ? 'from-green-500 to-green-400' : overallSentiment >= 50 ? 'from-amber-500 to-amber-400' : 'from-red-500 to-red-400'}`}
            style={{ width: `${overallSentiment}%` }}
          />
        </div>
      </div>
    </div>
  );
}
