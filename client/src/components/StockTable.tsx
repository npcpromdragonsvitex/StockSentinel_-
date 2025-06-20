import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, ShoppingCart, Minus } from 'lucide-react';
import { TradingModal } from './TradingModal';
import type { PortfolioWithPositions, Stock } from '@shared/schema';

interface StockTableProps {
  portfolio: PortfolioWithPositions;
}

export function StockTable({ portfolio }: StockTableProps) {
  const [tradingModal, setTradingModal] = useState<{
    isOpen: boolean;
    stock: Stock | null;
    mode: 'buy' | 'sell';
    currentPosition?: { quantity: number; averagePrice: string };
  }>({
    isOpen: false,
    stock: null,
    mode: 'buy'
  });

  const openTradingModal = (stock: Stock, mode: 'buy' | 'sell') => {
    const position = portfolio.positions.find(p => p.stockId === stock.id);
    setTradingModal({
      isOpen: true,
      stock,
      mode,
      currentPosition: position ? {
        quantity: position.quantity,
        averagePrice: position.averagePrice
      } : undefined
    });
  };

  const closeTradingModal = () => {
    setTradingModal({
      isOpen: false,
      stock: null,
      mode: 'buy'
    });
  };

  const getPositionForStock = (stockId: number) => {
    return portfolio.positions.find(p => p.stockId === stockId);
  };

  return (
    <div className="bg-slate-850 rounded-xl p-6 border border-slate-800">
      <h3 className="text-lg font-semibold mb-6">Анализ активов</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-3 px-2 text-sm font-medium text-slate-400">Актив</th>
              <th className="text-right py-3 px-2 text-sm font-medium text-slate-400">Цена</th>
              <th className="text-right py-3 px-2 text-sm font-medium text-slate-400">Изменение</th>
              <th className="text-right py-3 px-2 text-sm font-medium text-slate-400">В портфеле</th>
              <th className="text-right py-3 px-2 text-sm font-medium text-slate-400">P&L</th>
              <th className="text-right py-3 px-2 text-sm font-medium text-slate-400">Действия</th>
            </tr>
          </thead>
          <tbody>
            {portfolio.positions.map((position) => {
              const changePercent = parseFloat(position.stock.changePercent);
              const unrealizedPnL = parseFloat(position.unrealizedPnL);
              const unrealizedPnLPercent = parseFloat(position.unrealizedPnLPercent);
              
              return (
                <tr key={position.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                  <td className="py-4 px-2">
                    <div>
                      <div className="font-medium">{position.stock.ticker}</div>
                      <div className="text-sm text-slate-400">{position.stock.name}</div>
                    </div>
                  </td>
                  <td className="text-right py-4 px-2">
                    <div className="font-medium">
                      {parseFloat(position.stock.currentPrice).toLocaleString('ru-RU')} ₽
                    </div>
                  </td>
                  <td className="text-right py-4 px-2">
                    <div className={`flex items-center justify-end ${
                      changePercent >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {changePercent >= 0 ? (
                        <TrendingUp className="w-4 h-4 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 mr-1" />
                      )}
                      {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
                    </div>
                  </td>
                  <td className="text-right py-4 px-2">
                    <div>
                      <div className="font-medium">{position.quantity} шт.</div>
                      <div className="text-sm text-slate-400">
                        Ср. цена: {parseFloat(position.averagePrice).toLocaleString('ru-RU')} ₽
                      </div>
                    </div>
                  </td>
                  <td className="text-right py-4 px-2">
                    <div className={unrealizedPnL >= 0 ? 'text-green-400' : 'text-red-400'}>
                      <div className="font-medium">
                        {unrealizedPnL >= 0 ? '+' : ''}{unrealizedPnL.toLocaleString('ru-RU')} ₽
                      </div>
                      <div className="text-sm">
                        {unrealizedPnLPercent >= 0 ? '+' : ''}{unrealizedPnLPercent.toFixed(2)}%
                      </div>
                    </div>
                  </td>
                  <td className="text-right py-4 px-2">
                    <div className="flex justify-end space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openTradingModal(position.stock, 'buy')}
                        className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        Купить
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openTradingModal(position.stock, 'sell')}
                        className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                      >
                        <Minus className="w-4 h-4 mr-1" />
                        Продать
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <TradingModal
        isOpen={tradingModal.isOpen}
        onClose={closeTradingModal}
        stock={tradingModal.stock}
        mode={tradingModal.mode}
        portfolioId={portfolio.id}
        currentPosition={tradingModal.currentPosition}
      />
    </div>
  );
}