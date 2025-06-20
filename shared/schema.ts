import { pgTable, text, serial, integer, boolean, decimal, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const portfolios = pgTable("portfolios", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  totalValue: decimal("total_value", { precision: 15, scale: 2 }).notNull(),
  dailyGain: decimal("daily_gain", { precision: 15, scale: 2 }).notNull(),
  dailyGainPercent: decimal("daily_gain_percent", { precision: 5, scale: 2 }).notNull(),
  activePositions: integer("active_positions").notNull(),
  availableCash: decimal("available_cash", { precision: 15, scale: 2 }).notNull(),
  riskProfile: text("risk_profile").notNull(),
  budget: decimal("budget", { precision: 15, scale: 2 }).notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const stocks = pgTable("stocks", {
  id: serial("id").primaryKey(),
  ticker: text("ticker").notNull().unique(),
  name: text("name").notNull(),
  figi: text("figi").notNull().unique(),
  currency: text("currency").notNull(),
  lot: integer("lot").notNull(),
  currentPrice: decimal("current_price", { precision: 15, scale: 4 }).notNull(),
  previousPrice: decimal("previous_price", { precision: 15, scale: 4 }).notNull(),
  changePercent: decimal("change_percent", { precision: 5, scale: 2 }).notNull(),
  sector: text("sector"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const positions = pgTable("positions", {
  id: serial("id").primaryKey(),
  portfolioId: integer("portfolio_id").references(() => portfolios.id),
  stockId: integer("stock_id").references(() => stocks.id),
  quantity: integer("quantity").notNull(),
  averagePrice: decimal("average_price", { precision: 15, scale: 4 }).notNull(),
  currentValue: decimal("current_value", { precision: 15, scale: 2 }).notNull(),
  unrealizedPnL: decimal("unrealized_pnl", { precision: 15, scale: 2 }).notNull(),
  unrealizedPnLPercent: decimal("unrealized_pnl_percent", { precision: 5, scale: 2 }).notNull(),
  recommendation: text("recommendation").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const marketData = pgTable("market_data", {
  id: serial("id").primaryKey(),
  stockId: integer("stock_id").references(() => stocks.id),
  timestamp: timestamp("timestamp").notNull(),
  price: decimal("price", { precision: 15, scale: 4 }).notNull(),
  volume: integer("volume").notNull(),
});

export const recommendations = pgTable("recommendations", {
  id: serial("id").primaryKey(),
  portfolioId: integer("portfolio_id").references(() => portfolios.id),
  stockId: integer("stock_id").references(() => stocks.id),
  type: text("type").notNull(), // 'BUY', 'SELL', 'HOLD', 'STRATEGY'
  title: text("title").notNull(),
  description: text("description").notNull(),
  targetPrice: decimal("target_price", { precision: 15, scale: 4 }),
  riskLevel: text("risk_level").notNull(),
  potential: text("potential"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const newsSentiment = pgTable("news_sentiment", {
  id: serial("id").primaryKey(),
  stockId: integer("stock_id").references(() => stocks.id),
  sentiment: decimal("sentiment", { precision: 3, scale: 2 }).notNull(), // 0-100
  bullishPoints: text("bullish_points").array(),
  bearishPoints: text("bearish_points").array(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertPortfolioSchema = createInsertSchema(portfolios).omit({
  id: true,
  updatedAt: true,
});

export const insertStockSchema = createInsertSchema(stocks).omit({
  id: true,
  updatedAt: true,
});

export const insertPositionSchema = createInsertSchema(positions).omit({
  id: true,
  updatedAt: true,
});

export const insertRecommendationSchema = createInsertSchema(recommendations).omit({
  id: true,
  createdAt: true,
});

export const insertNewsSentimentSchema = createInsertSchema(newsSentiment).omit({
  id: true,
  updatedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertPortfolio = z.infer<typeof insertPortfolioSchema>;
export type Portfolio = typeof portfolios.$inferSelect;
export type InsertStock = z.infer<typeof insertStockSchema>;
export type Stock = typeof stocks.$inferSelect;
export type InsertPosition = z.infer<typeof insertPositionSchema>;
export type Position = typeof positions.$inferSelect;
export type InsertRecommendation = z.infer<typeof insertRecommendationSchema>;
export type Recommendation = typeof recommendations.$inferSelect;
export type InsertNewsSentiment = z.infer<typeof insertNewsSentimentSchema>;
export type NewsSentiment = typeof newsSentiment.$inferSelect;
export type MarketData = typeof marketData.$inferSelect;

// Extended types for API responses
export type PortfolioWithPositions = Portfolio & {
  positions: (Position & { stock: Stock })[];
};

export type StockWithSentiment = Stock & {
  sentiment?: NewsSentiment;
};
