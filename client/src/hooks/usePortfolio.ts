import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { PortfolioWithPositions } from "@shared/schema";
import type { PortfolioHistory } from "@/types/tinkoff";

export function usePortfolio(portfolioId: number) {
  return useQuery<PortfolioWithPositions>({
    queryKey: [`/api/portfolio/${portfolioId}`],
    staleTime: 30000, // 30 seconds
  });
}

export function usePortfolioHistory(portfolioId: number, days: number = 7) {
  return useQuery<PortfolioHistory[]>({
    queryKey: [`/api/portfolio/${portfolioId}/history?days=${days}`],
    staleTime: 60000, // 1 minute
  });
}

export function usePortfolioRecommendations(portfolioId: number) {
  return useQuery({
    queryKey: ['/api/portfolio', portfolioId, 'recommendations'],
    staleTime: 300000, // 5 minutes
  });
}

export function useUpdatePortfolio() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest("PATCH", `/api/portfolio/${id}`, data);
      return response.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [`/api/portfolio/${id}`] });
    },
  });
}

export function useRefreshData() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/refresh");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stocks'] });
    },
  });
}
