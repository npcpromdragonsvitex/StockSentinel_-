interface TinkoffConfig {
  token: string;
  baseUrl: string;
}

interface TinkoffInstrument {
  figi: string;
  ticker: string;
  name: string;
  currency: string;
  lot: number;
}

interface TinkoffPrice {
  figi: string;
  price: {
    currency: string;
    units: string;
    nano: number;
  };
}

interface TinkoffCandle {
  figi: string;
  interval: string;
  open: { currency: string; units: string; nano: number };
  close: { currency: string; units: string; nano: number };
  high: { currency: string; units: string; nano: number };
  low: { currency: string; units: string; nano: number };
  volume: string;
  time: string;
}

class TinkoffApiService {
  private config: TinkoffConfig;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 60000; // 1 minute

  constructor() {
    this.config = {
      token: process.env.TINKOFF_API_TOKEN || process.env.TINKOFF_TOKEN || "",
      baseUrl: "https://invest-public-api.tinkoff.ru/rest",
    };

    if (!this.config.token) {
      console.warn("Tinkoff API token not found in environment variables");
    }
  }

  private async makeRequest(endpoint: string, body?: Record<string, any>): Promise<any> {
    const cacheKey = `${endpoint}:${JSON.stringify(body || {})}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
      return cached.data;
    }

    if (!this.config.token) {
      throw new Error("Tinkoff API token not configured");
    }

    const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body || {}),
    });

    if (!response.ok) {
      throw new Error(`Tinkoff API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    
    return data;
  }

  private convertTinkoffPrice(price: { currency: string; units: string; nano: number }): number {
    return parseFloat(price.units) + (price.nano / 1000000000);
  }

  async getInstruments(): Promise<TinkoffInstrument[]> {
    try {
      const response = await this.makeRequest('/tinkoff.public.invest.api.contract.v1.InstrumentsService/Shares', {});
      return response.instruments || [];
    } catch (error) {
      console.error('Error fetching instruments:', error);
      return [];
    }
  }

  async getLastPrices(figis: string[]): Promise<TinkoffPrice[]> {
    try {
      const response = await this.makeRequest('/tinkoff.public.invest.api.contract.v1.MarketDataService/GetLastPrices', {
        figi: figis,
      });
      return response.lastPrices || [];
    } catch (error) {
      console.error('Error fetching last prices:', error);
      return [];
    }
  }

  async getCandles(figi: string, from: Date, to: Date, interval: string = 'CANDLE_INTERVAL_HOUR'): Promise<TinkoffCandle[]> {
    try {
      const response = await this.makeRequest('/tinkoff.public.invest.api.contract.v1.MarketDataService/GetCandles', {
        figi,
        from: from.toISOString(),
        to: to.toISOString(),
        interval,
      });
      return response.candles || [];
    } catch (error) {
      console.error('Error fetching candles:', error);
      return [];
    }
  }

  async getRussianStocks(): Promise<Array<{
    ticker: string;
    name: string;
    figi: string;
    currency: string;
    lot: number;
    currentPrice: number;
    previousPrice: number;
    changePercent: number;
  }>> {
    try {
      const instruments = await this.getInstruments();
      const russianStocks = instruments.filter(instrument => 
        ['SBER', 'GAZP', 'LKOH', 'MGNT', 'ROSN', 'NVTK', 'YNDX', 'OZON'].includes(instrument.ticker)
      );

      if (russianStocks.length === 0) {
        console.warn('No Russian stocks found');
        return [];
      }

      const figis = russianStocks.map(stock => stock.figi);
      const prices = await this.getLastPrices(figis);

      const results = [];
      for (const stock of russianStocks) {
        const priceData = prices.find(p => p.figi === stock.figi);
        if (priceData) {
          const currentPrice = this.convertTinkoffPrice(priceData.price);
          
          // Get previous day's price for change calculation
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          yesterday.setHours(0, 0, 0, 0);
          
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const candles = await this.getCandles(stock.figi, yesterday, today, 'CANDLE_INTERVAL_DAY');
          const previousPrice = candles.length > 0 ? this.convertTinkoffPrice(candles[0].close) : currentPrice;
          
          const changePercent = previousPrice > 0 ? ((currentPrice - previousPrice) / previousPrice) * 100 : 0;

          results.push({
            ticker: stock.ticker,
            name: stock.name,
            figi: stock.figi,
            currency: stock.currency,
            lot: stock.lot,
            currentPrice,
            previousPrice,
            changePercent,
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Error fetching Russian stocks:', error);
      return [];
    }
  }

  async getPortfolioHistory(figis: string[], days: number = 7): Promise<Array<{
    timestamp: Date;
    value: number;
  }>> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const allCandles = await Promise.all(
        figis.map(figi => this.getCandles(figi, startDate, endDate, 'CANDLE_INTERVAL_HOUR'))
      );

      // Aggregate portfolio value over time
      const valueHistory: Map<string, number> = new Map();
      
      allCandles.forEach((candles, index) => {
        candles.forEach(candle => {
          const timestamp = new Date(candle.time).toISOString();
          const price = this.convertTinkoffPrice(candle.close);
          const existingValue = valueHistory.get(timestamp) || 0;
          valueHistory.set(timestamp, existingValue + price * 100); // Assuming 100 shares each
        });
      });

      return Array.from(valueHistory.entries())
        .map(([timestamp, value]) => ({
          timestamp: new Date(timestamp),
          value,
        }))
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
        .slice(-24); // Last 24 hours
    } catch (error) {
      console.error('Error fetching portfolio history:', error);
      return [];
    }
  }
}

export const tinkoffApi = new TinkoffApiService();
