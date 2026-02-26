import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Basket, BasketLine } from '../services/types';
import { createEmptyBasket } from '../services/utils';
import { usePlatform } from './PlatformContext';

interface BasketContextType {
  basket: Basket;
  isLoading: boolean;
  addItem: (line: BasketLine) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  clear: () => Promise<void>;
}

const BasketContext = createContext<BasketContextType | undefined>(undefined);

// Internal component that uses hooks
const BasketProviderInner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { service } = usePlatform();
  const [basket, setBasket] = useState<Basket>(createEmptyBasket());
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refresh = useCallback(async () => {
    if (!service) return;

    setIsLoading(true);
    const data = await service.basket.getBasket();
    setBasket(data);
    setIsLoading(false);
  }, [service]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addItem = useCallback(
    async (line: BasketLine) => {
      if (!service) throw new Error('No platform service available');
      setIsLoading(true);
      const data = await service.basket.addToBasket(line);
      setBasket(data);
      setIsLoading(false);
    },
    [service]
  );

  const removeItem = useCallback(
    async (productId: string) => {
      if (!service) throw new Error('No platform service available');
      setIsLoading(true);
      const data = await service.basket.removeFromBasket(productId);
      setBasket(data);
      setIsLoading(false);
    },
    [service]
  );

  const updateItem = useCallback(
    async (productId: string, quantity: number) => {
      if (!service) throw new Error('No platform service available');
      setIsLoading(true);
      const data = await service.basket.updateBasketItem(productId, quantity);
      setBasket(data);
      setIsLoading(false);
    },
    [service]
  );

  const clear = useCallback(async () => {
    if (!service) throw new Error('No platform service available');
    setIsLoading(true);
    const data = await service.basket.clearBasket();
    setBasket(data);
    setIsLoading(false);
  }, [service]);

  const value = useMemo(
    () => ({
      basket,
      isLoading,
      addItem,
      removeItem,
      updateItem,
      clear,
    }),
    [basket, isLoading, addItem, removeItem, updateItem, clear]
  );

  return <BasketContext.Provider value={value}>{children}</BasketContext.Provider>;
};

export const BasketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <BasketProviderInner>{children}</BasketProviderInner>;
};

export const useBasket = () => {
  const context = useContext(BasketContext);
  if (!context) {
    throw new Error('useBasket must be used within a BasketProvider');
  }
  return context;
};
