import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface BuyStockParams {
  portfolioId: number;
  ticker: string;
  quantity: number;
  price: number;
}

interface SellStockParams {
  portfolioId: number;
  ticker: string;
  quantity: number;
}

export function useBuyStock() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: BuyStockParams) => {
      const response = await apiRequest("POST", `/api/portfolio/${params.portfolioId}/buy`, {
        ticker: params.ticker,
        quantity: params.quantity,
        price: params.price
      });
      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate portfolio data to refresh positions
      queryClient.invalidateQueries({ queryKey: [`/api/portfolio/${variables.portfolioId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio'] });
    },
  });
}

export function useSellStock() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: SellStockParams) => {
      const response = await apiRequest("POST", `/api/portfolio/${params.portfolioId}/sell`, {
        ticker: params.ticker,
        quantity: params.quantity
      });
      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate portfolio data to refresh positions
      queryClient.invalidateQueries({ queryKey: [`/api/portfolio/${variables.portfolioId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio'] });
    },
  });
}