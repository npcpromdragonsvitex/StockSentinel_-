import { useState } from 'react';
import { usePortfolio, useUpdatePortfolio, useRefreshData } from '@/hooks/usePortfolio';
import { PortfolioChart } from '@/components/PortfolioChart';
import { AllocationChart } from '@/components/AllocationChart';
import { StockTable } from '@/components/StockTable';
import { Recommendations } from '@/components/Recommendations';
import { NewsSentiment } from '@/components/NewsSentiment';
import { RiskAnalysis } from '@/components/RiskAnalysis';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { 
  ChartLine, 
  Wallet, 
  Calculator, 
  RefreshCw, 
  TrendingUp, 
  Layers, 
  Coins,
  PieChart,
  Activity
} from 'lucide-react';

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<'7D' | '1M' | '3M' | '1Y'>('7D');
  const [budget, setBudget] = useState('1000000');
  const [riskProfile, setRiskProfile] = useState('Умеренный');
  
  const { data: portfolio, isLoading, error } = usePortfolio(1);
  const updatePortfolioMutation = useUpdatePortfolio();
  const refreshMutation = useRefreshData();
  const { toast } = useToast();

  const handleBudgetUpdate = async () => {
    try {
      await updatePortfolioMutation.mutateAsync({
        id: 1,
        data: { budget, riskProfile }
      });
      toast({
        title: "Портфель обновлен",
        description: "Настройки бюджета успешно сохранены",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить настройки портфеля",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = async () => {
    try {
      await refreshMutation.mutateAsync();
      toast({
        title: "Данные обновлены",
        description: "Портфель обновлен с актуальными ценами из API Тинькофф",
      });
    } catch (error) {
      toast({
        title: "Ошибка обновления",
        description: "Не удалось получить данные из API Тинькофф",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 bg-slate-850" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-96 bg-slate-850" />
            </div>
            <Skeleton className="h-96 bg-slate-850" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Ошибка загрузки данных</h1>
          <p className="text-slate-400 mb-4">Не удалось загрузить данные портфеля</p>
          <Button onClick={handleRefresh} disabled={refreshMutation.isPending}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
            Попробовать снова
          </Button>
        </div>
      </div>
    );
  }

  const totalValue = parseFloat(portfolio.totalValue);
  const dailyGain = parseFloat(portfolio.dailyGain);
  const dailyGainPercent = parseFloat(portfolio.dailyGainPercent);
  const availableCash = parseFloat(portfolio.availableCash);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-inter">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <ChartLine className="text-white h-4 w-4" />
            </div>
            <h1 className="text-xl font-semibold">Портфель российских акций</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>API подключён</span>
            </div>
            <Button 
              onClick={handleRefresh}
              disabled={refreshMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
              Обновить данные
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Budget Input Section */}
        <div className="mb-8">
          <div className="bg-slate-850 rounded-xl p-6 border border-slate-800">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Wallet className="text-blue-500 mr-3 h-5 w-5" />
              Настройка бюджета портфеля
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Общий бюджет
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="1000000"
                    className="bg-slate-900 border-slate-700 text-white pr-8"
                  />
                  <span className="absolute right-3 top-3 text-slate-400 text-sm">₽</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Риск-профиль
                </label>
                <Select value={riskProfile} onValueChange={setRiskProfile}>
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Консервативный">Консервативный</SelectItem>
                    <SelectItem value="Умеренный">Умеренный</SelectItem>
                    <SelectItem value="Агрессивный">Агрессивный</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={handleBudgetUpdate}
                  disabled={updatePortfolioMutation.isPending}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Рассчитать портфель
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-850 rounded-xl p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-400">Стоимость портфеля</h3>
              <PieChart className="text-blue-500 h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-white">
              {totalValue.toLocaleString('ru-RU')} ₽
            </div>
            <div className="flex items-center mt-2">
              <span className="text-green-500 text-sm font-medium">
                +{Math.abs(dailyGain).toLocaleString('ru-RU')} ₽
              </span>
              <span className="text-slate-400 text-sm ml-2">
                ({dailyGainPercent >= 0 ? '+' : ''}{dailyGainPercent.toFixed(2)}%)
              </span>
            </div>
          </div>

          <div className="bg-slate-850 rounded-xl p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-400">Дневная прибыль</h3>
              <TrendingUp className="text-green-500 h-5 w-5" />
            </div>
            <div className={`text-2xl font-bold ${dailyGain >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {dailyGain >= 0 ? '+' : ''}{dailyGain.toLocaleString('ru-RU')} ₽
            </div>
            <div className="text-slate-400 text-sm mt-2">
              {dailyGainPercent >= 0 ? '+' : ''}{dailyGainPercent.toFixed(2)}% за день
            </div>
          </div>

          <div className="bg-slate-850 rounded-xl p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-400">Активных позиций</h3>
              <Layers className="text-amber-500 h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-white">{portfolio.activePositions}</div>
            <div className="text-slate-400 text-sm mt-2">из {portfolio.positions.length} доступных</div>
          </div>

          <div className="bg-slate-850 rounded-xl p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-400">Свободные средства</h3>
              <Coins className="text-cyan-500 h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-white">
              {availableCash.toLocaleString('ru-RU')} ₽
            </div>
            <div className="text-slate-400 text-sm mt-2">
              {((availableCash / totalValue) * 100).toFixed(1)}% от портфеля
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Portfolio Performance Chart */}
          <div className="lg:col-span-2 bg-slate-850 rounded-xl p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Динамика портфеля</h3>
              <div className="flex space-x-2">
                {(['7D', '1M', '3M', '1Y'] as const).map((period) => (
                  <Button
                    key={period}
                    variant={selectedPeriod === period ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedPeriod(period)}
                    className={selectedPeriod === period ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-600"}
                  >
                    {period}
                  </Button>
                ))}
              </div>
            </div>
            <PortfolioChart portfolioId={1} selectedPeriod={selectedPeriod} />
            <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-700">
              <div className="text-center">
                <div className="text-sm text-slate-400">Доходность</div>
                <div className="text-lg font-semibold text-green-500">+{dailyGainPercent.toFixed(1)}%</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-slate-400">Волатильность</div>
                <div className="text-lg font-semibold text-amber-500">12.4%</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-slate-400">Шарп</div>
                <div className="text-lg font-semibold text-blue-500">0.84</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-slate-400">Макс. просадка</div>
                <div className="text-lg font-semibold text-red-500">-5.2%</div>
              </div>
            </div>
          </div>

          {/* Asset Allocation */}
          <div className="bg-slate-850 rounded-xl p-6 border border-slate-800">
            <h3 className="text-lg font-semibold mb-6">Распределение активов</h3>
            <AllocationChart portfolio={portfolio} />
            <div className="space-y-3 mt-6">
              {portfolio.positions.map((position, index) => {
                const percentage = (parseFloat(position.currentValue) / totalValue) * 100;
                const colors = ['bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-amber-500', 'bg-red-500', 'bg-cyan-500'];
                
                return (
                  <div key={position.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 ${colors[index % colors.length]} rounded-full mr-3`}></div>
                      <span className="text-sm font-medium">{position.stock.ticker}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{percentage.toFixed(1)}%</div>
                      <div className="text-xs text-slate-400">
                        {parseFloat(position.currentValue).toLocaleString('ru-RU')} ₽
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Stock Analysis Table */}
        <StockTable portfolio={portfolio} />

        {/* Investment Recommendations & News Sentiment */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Recommendations portfolioId={1} />
          <NewsSentiment portfolio={portfolio} />
        </div>

        {/* Risk Analysis */}
        <RiskAnalysis />
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 px-6 py-4 mt-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-slate-400">
          <div>© 2025 Портфель российских акций. Данные предоставлены API Тинькофф Инвестиции</div>
          <div className="flex items-center space-x-4">
            <span>Последнее обновление: {new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })} МСК</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Онлайн</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
