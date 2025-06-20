export interface StockData {
  ticker: string;
  name: string;
  figi: string;
  currency: string;
  lot: number;
  currentPrice: number;
  previousPrice: number;
  changePercent: number;
  sector?: string;
}

export interface PortfolioHistory {
  timestamp: Date;
  value: number;
}

export interface PortfolioMetrics {
  totalValue: number;
  dailyGain: number;
  dailyGainPercent: number;
  activePositions: number;
  availableCash: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
}

export interface Position {
  id: number;
  stock: StockData;
  quantity: number;
  averagePrice: number;
  currentValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  recommendation: 'BUY' | 'SELL' | 'HOLD' | 'PARTIAL_SELL';
}

export interface Newssentiment {
  ticker: string;
  sentiment: number; // 0-100
  bullishPoints: string[];
  bearishPoints: string[];
}

export interface Recommendation {
  id: number;
  type: 'BUY' | 'SELL' | 'HOLD' | 'STRATEGY';
  title: string;
  description: string;
  targetPrice?: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  potential?: string;
  ticker?: string;
}

export interface RiskMetrics {
  concentrationRisk: 'HIGH' | 'MEDIUM' | 'LOW';
  currencyRisk: 'HIGH' | 'MEDIUM' | 'LOW';
  liquidityRisk: 'HIGH' | 'MEDIUM' | 'LOW';
}
