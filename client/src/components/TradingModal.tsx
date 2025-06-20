import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Stock } from '@shared/schema';

const buyFormSchema = z.object({
  quantity: z.number().min(1, 'Количество должно быть больше 0'),
  price: z.number().min(0.01, 'Цена должна быть больше 0')
});

const sellFormSchema = z.object({
  quantity: z.number().min(1, 'Количество должно быть больше 0')
});

interface TradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  stock: Stock | null;
  mode: 'buy' | 'sell';
  portfolioId: number;
  currentPosition?: {
    quantity: number;
    averagePrice: string;
  };
}

export function TradingModal({ isOpen, onClose, stock, mode, portfolioId, currentPosition }: TradingModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const buyMutation = useMutation({
    mutationFn: async (params: { ticker: string; quantity: number; price: number }) => {
      const response = await apiRequest("POST", `/api/portfolio/${portfolioId}/buy`, params);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/portfolio/${portfolioId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio'] });
    },
  });

  const sellMutation = useMutation({
    mutationFn: async (params: { ticker: string; quantity: number }) => {
      const response = await apiRequest("POST", `/api/portfolio/${portfolioId}/sell`, params);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/portfolio/${portfolioId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/portfolio'] });
    },
  });

  const buyForm = useForm<z.infer<typeof buyFormSchema>>({
    resolver: zodResolver(buyFormSchema),
    defaultValues: {
      quantity: 1,
      price: stock ? parseFloat(stock.currentPrice) : 0
    }
  });

  const sellForm = useForm<z.infer<typeof sellFormSchema>>({
    resolver: zodResolver(sellFormSchema),
    defaultValues: {
      quantity: 1
    }
  });

  const onBuySubmit = async (values: z.infer<typeof buyFormSchema>) => {
    if (!stock) return;
    
    try {
      await buyMutation.mutateAsync({
        ticker: stock.ticker,
        quantity: values.quantity,
        price: values.price
      });
      
      toast({
        title: "Покупка выполнена",
        description: `Куплено ${values.quantity} акций ${stock.ticker} по цене ${values.price} ₽`,
      });
      
      onClose();
      buyForm.reset();
    } catch (error) {
      toast({
        title: "Ошибка покупки",
        description: "Не удалось выполнить покупку акций",
        variant: "destructive",
      });
    }
  };

  const onSellSubmit = async (values: z.infer<typeof sellFormSchema>) => {
    if (!stock) return;
    
    try {
      await sellMutation.mutateAsync({
        ticker: stock.ticker,
        quantity: values.quantity
      });
      
      toast({
        title: "Продажа выполнена",
        description: `Продано ${values.quantity} акций ${stock.ticker}`,
      });
      
      onClose();
      sellForm.reset();
    } catch (error) {
      toast({
        title: "Ошибка продажи",
        description: "Не удалось выполнить продажу акций",
        variant: "destructive",
      });
    }
  };

  if (!stock) return null;

  const currentPrice = parseFloat(stock.currentPrice);
  const isBuying = mode === 'buy';
  const mutation = isBuying ? buyMutation : sellMutation;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-white">
            {isBuying ? 'Купить' : 'Продать'} {stock.ticker}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {stock.name} • Текущая цена: {currentPrice.toLocaleString('ru-RU')} ₽
            {!isBuying && currentPosition && (
              <div className="mt-2">
                В портфеле: {currentPosition.quantity} шт. по средней цене {parseFloat(currentPosition.averagePrice).toLocaleString('ru-RU')} ₽
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        {isBuying ? (
          <Form {...buyForm}>
            <form onSubmit={buyForm.handleSubmit(onBuySubmit)} className="space-y-4">
              <FormField
                control={buyForm.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Количество</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={buyForm.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Цена за акцию (₽)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="bg-slate-800 p-3 rounded-lg">
                <div className="text-sm text-slate-400 mb-1">Общая стоимость:</div>
                <div className="text-lg font-semibold text-white">
                  {((buyForm.watch('quantity') || 0) * (buyForm.watch('price') || 0)).toLocaleString('ru-RU')} ₽
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  disabled={buyMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {buyMutation.isPending ? 'Покупка...' : 'Купить'}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <Form {...sellForm}>
            <form onSubmit={sellForm.handleSubmit(onSellSubmit)} className="space-y-4">
              <FormField
                control={sellForm.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Количество</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max={currentPosition ? currentPosition.quantity : undefined}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  disabled={sellMutation.isPending}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {sellMutation.isPending ? 'Продажа...' : 'Продать'}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}