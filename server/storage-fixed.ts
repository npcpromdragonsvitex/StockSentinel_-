import { 
  users, 
  portfolios, 
  stocks, 
  positions, 
  recommendations, 
  newsSentiment,
  marketData,
  type User, 
  type InsertUser, 
  type Portfolio, 
  type InsertPortfolio,
  type Stock,
  type InsertStock,
  type Position,
  type InsertPosition,
  type Recommendation,
  type InsertRecommendation,
  type NewsSentiment,
  type InsertNewsSentiment,
  type PortfolioWithPositions,
  type StockWithSentiment,
  type MarketData
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Portfolio methods
  getPortfolio(id: number): Promise<Portfolio | undefined>;
  getPortfolioWithPositions(id: number): Promise<PortfolioWithPositions | undefined>;
  createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio>;
  updatePortfolio(id: number, portfolio: Partial<InsertPortfolio>): Promise<Portfolio>;
  
  // Stock methods
  getStock(id: number): Promise<Stock | undefined>;
  getStockByTicker(ticker: string): Promise<Stock | undefined>;
  getStockWithSentiment(ticker: string): Promise<StockWithSentiment | undefined>;
  getAllStocks(): Promise<Stock[]>;
  createStock(stock: InsertStock): Promise<Stock>;
  updateStock(id: number, stock: Partial<InsertStock>): Promise<Stock>;
  
  // Position methods
  getPositionsByPortfolio(portfolioId: number): Promise<Position[]>;
  createPosition(position: InsertPosition): Promise<Position>;
  updatePosition(id: number, position: Partial<InsertPosition>): Promise<Position>;
  
  // Recommendation methods
  getRecommendationsByPortfolio(portfolioId: number): Promise<Recommendation[]>;
  createRecommendation(recommendation: InsertRecommendation): Promise<Recommendation>;
  
  // News sentiment methods
  getNewsSentiment(stockId: number): Promise<NewsSentiment | undefined>;
  createNewsSentiment(sentiment: InsertNewsSentiment): Promise<NewsSentiment>;
  updateNewsSentiment(stockId: number, sentiment: Partial<InsertNewsSentiment>): Promise<NewsSentiment>;
  
  // Market data methods
  getMarketDataHistory(stockId: number, hours: number): Promise<MarketData[]>;
  createMarketData(data: Omit<MarketData, 'id'>): Promise<MarketData>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private portfolios: Map<number, Portfolio>;
  private stocks: Map<number, Stock>;
  private positions: Map<number, Position>;
  private recommendations: Map<number, Recommendation>;
  private newsSentiments: Map<number, NewsSentiment>;
  private marketDataStore: Map<number, MarketData>;
  private currentUserId: number;
  private currentPortfolioId: number;
  private currentStockId: number;
  private currentPositionId: number;
  private currentRecommendationId: number;
  private currentNewsSentimentId: number;
  private currentMarketDataId: number;

  constructor() {
    this.users = new Map();
    this.portfolios = new Map();
    this.stocks = new Map();
    this.positions = new Map();
    this.recommendations = new Map();
    this.newsSentiments = new Map();
    this.marketDataStore = new Map();
    this.currentUserId = 1;
    this.currentPortfolioId = 1;
    this.currentStockId = 1;
    this.currentPositionId = 1;
    this.currentRecommendationId = 1;
    this.currentNewsSentimentId = 1;
    this.currentMarketDataId = 1;
    
    // Initialize with some default data
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create default user
    const defaultUser: User = {
      id: 1,
      username: "demo",
      password: "demo"
    };
    this.users.set(1, defaultUser);
    
    // Create default stocks with Russian companies
    const defaultStocks: Stock[] = [
      {
        id: 1,
        ticker: "SBER",
        name: "Сбербанк",
        figi: "BBG004730N88",
        currency: "RUB",
        lot: 10,
        currentPrice: "265.50",
        previousPrice: "260.00",
        changePercent: "2.12",
        sector: "Финансы",
        updatedAt: new Date()
      },
      {
        id: 2,
        ticker: "LKOH",
        name: "Лукойл",
        figi: "BBG004731354",
        currency: "RUB",
        lot: 1,
        currentPrice: "6420.00",
        previousPrice: "6350.00",
        changePercent: "1.10",
        sector: "Нефть и газ",
        updatedAt: new Date()
      },
      {
        id: 3,
        ticker: "MGNT",
        name: "Магнит",
        figi: "BBG004730RP0",
        currency: "RUB",
        lot: 10,
        currentPrice: "5680.00",
        previousPrice: "5720.00",
        changePercent: "-0.70",
        sector: "Потребительские товары",
        updatedAt: new Date()
      },
      {
        id: 4,
        ticker: "GAZP",
        name: "Газпром",
        figi: "BBG004730ZJ9",
        currency: "RUB",
        lot: 10,
        currentPrice: "128.50",
        previousPrice: "126.00",
        changePercent: "1.98",
        sector: "Нефть и газ",
        updatedAt: new Date()
      }
    ];
    
    defaultStocks.forEach(stock => this.stocks.set(stock.id, stock));
    this.currentStockId = 5;
    
    // Create default positions
    const defaultPositions: Position[] = [
      {
        id: 1,
        portfolioId: 1,
        stockId: 1,
        quantity: 174,
        averagePrice: "250.00",
        currentValue: "46217.00",
        unrealizedPnL: "2697.00",
        unrealizedPnLPercent: "6.20",
        recommendation: "BUY",
        updatedAt: new Date()
      },
      {
        id: 2,
        portfolioId: 1,
        stockId: 2,
        quantity: 3,
        averagePrice: "6300.00",
        currentValue: "19260.00",
        unrealizedPnL: "360.00",
        unrealizedPnLPercent: "1.90",
        recommendation: "HOLD",
        updatedAt: new Date()
      },
      {
        id: 3,
        portfolioId: 1,
        stockId: 3,
        quantity: 2,
        averagePrice: "5800.00",
        currentValue: "11360.00",
        unrealizedPnL: "-240.00",
        unrealizedPnLPercent: "-2.07",
        recommendation: "PARTIAL_SELL",
        updatedAt: new Date()
      },
      {
        id: 4,
        portfolioId: 1,
        stockId: 4,
        quantity: 10,
        averagePrice: "125.00",
        currentValue: "1285.00",
        unrealizedPnL: "35.00",
        unrealizedPnLPercent: "2.80",
        recommendation: "HOLD",
        updatedAt: new Date()
      }
    ];
    
    defaultPositions.forEach(position => this.positions.set(position.id, position));
    this.currentPositionId = 5;
    
    // Calculate total portfolio value
    const totalPositionValue = defaultPositions.reduce((sum, pos) => sum + parseFloat(pos.currentValue), 0);
    const availableCash = 15332.00;
    const totalValue = totalPositionValue + availableCash;
    const totalGain = defaultPositions.reduce((sum, pos) => sum + parseFloat(pos.unrealizedPnL), 0);
    const dailyGainPercent = (totalGain / (totalValue - totalGain)) * 100;
    
    // Create default portfolio
    const defaultPortfolio: Portfolio = {
      id: 1,
      userId: 1,
      name: "Основной портфель",
      totalValue: totalValue.toFixed(2),
      dailyGain: totalGain.toFixed(2),
      dailyGainPercent: dailyGainPercent.toFixed(2),
      activePositions: 4,
      availableCash: availableCash.toFixed(2),
      riskProfile: "Умеренный",
      budget: "110000.00",
      updatedAt: new Date()
    };
    this.portfolios.set(1, defaultPortfolio);
    
    // Add default recommendations
    const defaultRecommendations: Recommendation[] = [
      {
        id: 1,
        portfolioId: 1,
        stockId: 1,
        type: "BUY",
        title: "Увеличить позицию в SBER",
        description: "Сбербанк показывает стабильный рост. Рекомендуется докупить на текущих уровнях.",
        targetPrice: "285.00",
        riskLevel: "LOW",
        potential: "+8-12%",
        createdAt: new Date()
      },
      {
        id: 2,
        portfolioId: 1,
        stockId: 3,
        type: "SELL",
        title: "Зафиксировать прибыль MGNT",
        description: "Магнит достиг целевых уровней. Рекомендуется частичная фиксация прибыли.",
        targetPrice: null,
        riskLevel: "MEDIUM",
        potential: "Фиксация: +15%",
        createdAt: new Date()
      }
    ];
    
    defaultRecommendations.forEach(rec => this.recommendations.set(rec.id, rec));
    this.currentRecommendationId = 3;
    
    // Add news sentiment data
    const defaultSentiments: NewsSentiment[] = [
      {
        id: 1,
        stockId: 1,
        sentiment: "75.00",
        bullishPoints: ["Рост кредитного портфеля на 12% г/г", "Увеличение дивидендных выплат"],
        bearishPoints: ["Возможное ужесточение регулирования"],
        updatedAt: new Date()
      },
      {
        id: 2,
        stockId: 4,
        sentiment: "45.00",
        bullishPoints: ["Высокие цены на газ в Европе"],
        bearishPoints: ["Геополитические риски", "Снижение экспортных объёмов"],
        updatedAt: new Date()
      }
    ];
    
    defaultSentiments.forEach(sentiment => this.newsSentiments.set(sentiment.id, sentiment));
    this.currentNewsSentimentId = 3;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Portfolio methods
  async getPortfolio(id: number): Promise<Portfolio | undefined> {
    return this.portfolios.get(id);
  }

  async getPortfolioWithPositions(id: number): Promise<PortfolioWithPositions | undefined> {
    const portfolio = this.portfolios.get(id);
    if (!portfolio) return undefined;

    const portfolioPositions = Array.from(this.positions.values())
      .filter(position => position.portfolioId === id);

    const positionsWithStocks = await Promise.all(
      portfolioPositions.map(async (position) => {
        const stock = this.stocks.get(position.stockId!);
        return {
          ...position,
          stock: stock!
        };
      })
    );

    return {
      ...portfolio,
      positions: positionsWithStocks
    };
  }

  async createPortfolio(insertPortfolio: InsertPortfolio): Promise<Portfolio> {
    const id = this.currentPortfolioId++;
    const portfolio: Portfolio = { 
      ...insertPortfolio, 
      id,
      updatedAt: new Date()
    };
    this.portfolios.set(id, portfolio);
    return portfolio;
  }

  async updatePortfolio(id: number, portfolioUpdate: Partial<InsertPortfolio>): Promise<Portfolio> {
    const existing = this.portfolios.get(id);
    if (!existing) throw new Error('Portfolio not found');
    
    const updated: Portfolio = { 
      ...existing, 
      ...portfolioUpdate,
      updatedAt: new Date()
    };
    this.portfolios.set(id, updated);
    return updated;
  }

  // Stock methods
  async getStock(id: number): Promise<Stock | undefined> {
    return this.stocks.get(id);
  }

  async getStockByTicker(ticker: string): Promise<Stock | undefined> {
    return Array.from(this.stocks.values()).find(stock => stock.ticker === ticker);
  }

  async getStockWithSentiment(ticker: string): Promise<StockWithSentiment | undefined> {
    const stock = await this.getStockByTicker(ticker);
    if (!stock) return undefined;

    const sentiment = Array.from(this.newsSentiments.values()).find(s => s.stockId === stock.id);
    return {
      ...stock,
      sentiment
    };
  }

  async getAllStocks(): Promise<Stock[]> {
    return Array.from(this.stocks.values());
  }

  async createStock(insertStock: InsertStock): Promise<Stock> {
    const id = this.currentStockId++;
    const stock: Stock = { 
      ...insertStock, 
      id,
      updatedAt: new Date()
    };
    this.stocks.set(id, stock);
    return stock;
  }

  async updateStock(id: number, stockUpdate: Partial<InsertStock>): Promise<Stock> {
    const existing = this.stocks.get(id);
    if (!existing) throw new Error('Stock not found');
    
    const updated: Stock = { 
      ...existing, 
      ...stockUpdate,
      updatedAt: new Date()
    };
    this.stocks.set(id, updated);
    return updated;
  }

  // Position methods
  async getPositionsByPortfolio(portfolioId: number): Promise<Position[]> {
    return Array.from(this.positions.values()).filter(position => position.portfolioId === portfolioId);
  }

  async createPosition(insertPosition: InsertPosition): Promise<Position> {
    const id = this.currentPositionId++;
    const position: Position = { 
      ...insertPosition, 
      id,
      updatedAt: new Date()
    };
    this.positions.set(id, position);
    return position;
  }

  async updatePosition(id: number, positionUpdate: Partial<InsertPosition>): Promise<Position> {
    const existing = this.positions.get(id);
    if (!existing) throw new Error('Position not found');
    
    const updated: Position = { 
      ...existing, 
      ...positionUpdate,
      updatedAt: new Date()
    };
    this.positions.set(id, updated);
    return updated;
  }

  // Recommendation methods
  async getRecommendationsByPortfolio(portfolioId: number): Promise<Recommendation[]> {
    return Array.from(this.recommendations.values()).filter(rec => rec.portfolioId === portfolioId);
  }

  async createRecommendation(insertRecommendation: InsertRecommendation): Promise<Recommendation> {
    const id = this.currentRecommendationId++;
    const recommendation: Recommendation = { 
      ...insertRecommendation, 
      id,
      createdAt: new Date()
    };
    this.recommendations.set(id, recommendation);
    return recommendation;
  }

  // News sentiment methods
  async getNewsSentiment(stockId: number): Promise<NewsSentiment | undefined> {
    return Array.from(this.newsSentiments.values()).find(sentiment => sentiment.stockId === stockId);
  }

  async createNewsSentiment(insertSentiment: InsertNewsSentiment): Promise<NewsSentiment> {
    const id = this.currentNewsSentimentId++;
    const sentiment: NewsSentiment = { 
      ...insertSentiment, 
      id,
      updatedAt: new Date()
    };
    this.newsSentiments.set(id, sentiment);
    return sentiment;
  }

  async updateNewsSentiment(stockId: number, sentimentUpdate: Partial<InsertNewsSentiment>): Promise<NewsSentiment> {
    const existing = Array.from(this.newsSentiments.values()).find(s => s.stockId === stockId);
    if (!existing) throw new Error('News sentiment not found');
    
    const updated: NewsSentiment = { 
      ...existing, 
      ...sentimentUpdate,
      updatedAt: new Date()
    };
    this.newsSentiments.set(existing.id, updated);
    return updated;
  }

  // Market data methods
  async getMarketDataHistory(stockId: number, hours: number): Promise<MarketData[]> {
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - hours);
    
    return Array.from(this.marketDataStore.values())
      .filter(data => data.stockId === stockId && data.timestamp >= cutoff)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async createMarketData(marketData: Omit<MarketData, 'id'>): Promise<MarketData> {
    const id = this.currentMarketDataId++;
    const data: MarketData = { ...marketData, id };
    this.marketDataStore.set(id, data);
    return data;
  }
}

export const storage = new MemStorage();