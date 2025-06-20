import { useQuery } from "@tanstack/react-query";
import type { StockData, Newssentiment } from "@/types/tinkoff";

export function useStocks() {
  return useQuery<StockData[]>({
    queryKey: ['/api/stocks'],
    staleTime: 30000, // 30 seconds
  });
}

export function useStockSentiment(ticker: string) {
  return useQuery<Newssentiment>({
    queryKey: ['/api/stocks', ticker, 'sentiment'],
    staleTime: 300000, // 5 minutes
    enabled: !!ticker,
  });
}
