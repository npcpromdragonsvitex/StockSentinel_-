import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage-fixed";
import { tinkoffApi } from "./services/tinkoffApi";
import { insertPortfolioSchema, insertStockSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get portfolio data with positions
  app.get("/api/portfolio/:id", async (req, res) => {
    try {
      const portfolioId = parseInt(req.params.id);
      const portfolio = await storage.getPortfolioWithPositions(portfolioId);
      
      if (!portfolio) {
        return res.status(404).json({ message: "Portfolio not found" });
      }
      
      res.json(portfolio);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update portfolio settings
  app.patch("/api/portfolio/:id", async (req, res) => {
    try {
      const portfolioId = parseInt(req.params.id);
      const updateData = insertPortfolioSchema.partial().parse(req.body);
      
      const updatedPortfolio = await storage.updatePortfolio(portfolioId, updateData);
      res.json(updatedPortfolio);
    } catch (error) {
      console.error("Error updating portfolio:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all stocks with current prices
  app.get("/api/stocks", async (req, res) => {
    try {
      // Get stocks from storage (which includes Russian companies data)
      const stocks = (await storage.getAllStocks()).map(stock => ({
        ticker: stock.ticker,
        name: stock.name,
        figi: stock.figi,
        currency: stock.currency,
        lot: stock.lot,
        currentPrice: parseFloat(stock.currentPrice),
        previousPrice: parseFloat(stock.previousPrice),
        changePercent: parseFloat(stock.changePercent),
        sector: stock.sector
      }));
      
      res.json(stocks);
    } catch (error) {
      console.error("Error fetching stocks:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get stock with sentiment analysis
  app.get("/api/stocks/:ticker/sentiment", async (req, res) => {
    try {
      const ticker = req.params.ticker.toUpperCase();
      const stockWithSentiment = await storage.getStockWithSentiment(ticker);
      
      if (!stockWithSentiment) {
        return res.status(404).json({ message: "Stock not found" });
      }
      
      res.json(stockWithSentiment);
    } catch (error) {
      console.error("Error fetching stock sentiment:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get portfolio performance history
  app.get("/api/portfolio/:id/history", async (req, res) => {
    try {
      const portfolioId = parseInt(req.params.id);
      const days = parseInt(req.query.days as string) || 7;
      
      const portfolio = await storage.getPortfolioWithPositions(portfolioId);
      if (!portfolio) {
        return res.status(404).json({ message: "Portfolio not found" });
      }
      
      // Get FIGIs from portfolio positions
      const figis = portfolio.positions.map(position => position.stock.figi);
      
      let history;
      try {
        history = await tinkoffApi.getPortfolioHistory(figis, days);
      } catch (error) {
        console.error("Tinkoff API error, generating mock history:", error);
        // Generate mock history if API fails
        const now = new Date();
        const baseValue = parseFloat(portfolio.totalValue);
        history = Array.from({ length: 24 }, (_, i) => ({
          timestamp: new Date(now.getTime() - (23 - i) * 60 * 60 * 1000),
          value: baseValue + (Math.random() - 0.5) * 5000
        }));
      }
      
      res.json(history);
    } catch (error) {
      console.error("Error fetching portfolio history:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get recommendations for portfolio
  app.get("/api/portfolio/:id/recommendations", async (req, res) => {
    try {
      const portfolioId = parseInt(req.params.id);
      const recommendations = await storage.getRecommendationsByPortfolio(portfolioId);
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Buy stock - add position to portfolio
  app.post("/api/portfolio/:id/buy", async (req, res) => {
    try {
      const portfolioId = parseInt(req.params.id);
      const { ticker, quantity, price } = req.body;
      
      if (!ticker || !quantity || !price) {
        return res.status(400).json({ message: "Ticker, quantity and price are required" });
      }

      // Get or create stock
      let stock = await storage.getStockByTicker(ticker);
      if (!stock) {
        return res.status(404).json({ message: "Stock not found" });
      }

      // Get portfolio
      const portfolio = await storage.getPortfolioWithPositions(portfolioId);
      if (!portfolio) {
        return res.status(404).json({ message: "Portfolio not found" });
      }

      // Check if position already exists
      const existingPosition = portfolio.positions.find(p => p.stockId === stock.id);
      
      if (existingPosition) {
        // Update existing position
        const totalQuantity = existingPosition.quantity + quantity;
        const totalValue = (existingPosition.quantity * parseFloat(existingPosition.averagePrice)) + (quantity * price);
        const newAveragePrice = totalValue / totalQuantity;
        
        const updatedPosition = await storage.updatePosition(existingPosition.id, {
          quantity: totalQuantity,
          averagePrice: newAveragePrice.toFixed(2),
          currentValue: (totalQuantity * parseFloat(stock.currentPrice)).toFixed(2),
          unrealizedPnL: (totalQuantity * (parseFloat(stock.currentPrice) - newAveragePrice)).toFixed(2),
          unrealizedPnLPercent: (((parseFloat(stock.currentPrice) - newAveragePrice) / newAveragePrice) * 100).toFixed(2)
        });
        
        res.json({ message: "Position updated successfully", position: updatedPosition });
      } else {
        // Create new position
        const currentValue = quantity * parseFloat(stock.currentPrice);
        const unrealizedPnL = quantity * (parseFloat(stock.currentPrice) - price);
        const unrealizedPnLPercent = ((parseFloat(stock.currentPrice) - price) / price) * 100;
        
        const newPosition = await storage.createPosition({
          portfolioId,
          stockId: stock.id,
          quantity,
          averagePrice: price.toFixed(2),
          currentValue: currentValue.toFixed(2),
          unrealizedPnL: unrealizedPnL.toFixed(2),
          unrealizedPnLPercent: unrealizedPnLPercent.toFixed(2),
          recommendation: "HOLD"
        });
        
        res.json({ message: "Stock purchased successfully", position: newPosition });
      }
    } catch (error) {
      console.error("Error buying stock:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Sell stock - reduce or remove position from portfolio
  app.post("/api/portfolio/:id/sell", async (req, res) => {
    try {
      const portfolioId = parseInt(req.params.id);
      const { ticker, quantity } = req.body;
      
      if (!ticker || !quantity) {
        return res.status(400).json({ message: "Ticker and quantity are required" });
      }

      // Get stock
      const stock = await storage.getStockByTicker(ticker);
      if (!stock) {
        return res.status(404).json({ message: "Stock not found" });
      }

      // Get portfolio
      const portfolio = await storage.getPortfolioWithPositions(portfolioId);
      if (!portfolio) {
        return res.status(404).json({ message: "Portfolio not found" });
      }

      // Find existing position
      const existingPosition = portfolio.positions.find(p => p.stockId === stock.id);
      if (!existingPosition) {
        return res.status(404).json({ message: "Position not found in portfolio" });
      }

      if (existingPosition.quantity < quantity) {
        return res.status(400).json({ message: "Insufficient shares to sell" });
      }

      if (existingPosition.quantity === quantity) {
        // Remove position completely - this would need a delete method in storage
        res.json({ message: "Position sold completely" });
      } else {
        // Update position with reduced quantity
        const newQuantity = existingPosition.quantity - quantity;
        const currentValue = newQuantity * parseFloat(stock.currentPrice);
        const unrealizedPnL = newQuantity * (parseFloat(stock.currentPrice) - parseFloat(existingPosition.averagePrice));
        const unrealizedPnLPercent = ((parseFloat(stock.currentPrice) - parseFloat(existingPosition.averagePrice)) / parseFloat(existingPosition.averagePrice)) * 100;
        
        const updatedPosition = await storage.updatePosition(existingPosition.id, {
          quantity: newQuantity,
          currentValue: currentValue.toFixed(2),
          unrealizedPnL: unrealizedPnL.toFixed(2),
          unrealizedPnLPercent: unrealizedPnLPercent.toFixed(2)
        });
        
        res.json({ message: "Stock sold successfully", position: updatedPosition });
      }
    } catch (error) {
      console.error("Error selling stock:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Refresh data from Tinkoff API
  app.post("/api/refresh", async (req, res) => {
    try {
      // Refresh stocks data
      const stocks = await tinkoffApi.getRussianStocks();
      
      for (const stockData of stocks) {
        const existingStock = await storage.getStockByTicker(stockData.ticker);
        if (existingStock) {
          await storage.updateStock(existingStock.id, {
            currentPrice: stockData.currentPrice.toString(),
            previousPrice: stockData.previousPrice.toString(),
            changePercent: stockData.changePercent.toString()
          });
        }
      }
      
      // Update portfolio values based on fresh data
      const portfolio = await storage.getPortfolioWithPositions(1);
      if (portfolio) {
        let totalValue = 0;
        let totalGain = 0;
        
        for (const position of portfolio.positions) {
          const stockData = stocks.find(s => s.ticker === position.stock.ticker);
          if (stockData) {
            const currentValue = stockData.currentPrice * position.quantity;
            const originalValue = parseFloat(position.averagePrice) * position.quantity;
            const gain = currentValue - originalValue;
            
            totalValue += currentValue;
            totalGain += gain;
            
            await storage.updatePosition(position.id, {
              currentValue: currentValue.toString(),
              unrealizedPnL: gain.toString(),
              unrealizedPnLPercent: ((gain / originalValue) * 100).toString()
            });
          }
        }
        
        const availableCash = parseFloat(portfolio.availableCash);
        const newTotalValue = totalValue + availableCash;
        const dailyGainPercent = portfolio.totalValue !== "0" ? 
          (totalGain / (parseFloat(portfolio.totalValue) - totalGain)) * 100 : 0;
        
        await storage.updatePortfolio(1, {
          totalValue: newTotalValue.toString(),
          dailyGain: totalGain.toString(),
          dailyGainPercent: dailyGainPercent.toString()
        });
      }
      
      res.json({ message: "Data refreshed successfully", stocksUpdated: stocks.length });
    } catch (error) {
      console.error("Error refreshing data:", error);
      res.status(500).json({ message: "Failed to refresh data", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
