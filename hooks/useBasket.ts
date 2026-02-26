import { useState, useEffect } from 'react';
import { usePlatform } from '../context/PlatformContext';
import type { Basket, BasketLine } from '../services/interfaces';
import { useLogger } from './useLogger';

export const useBasket = () => {
  const { service } = usePlatform();
  const logger = useLogger('useBasket');
  const [basket, setBasket] = useState<Basket | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    if (!service) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await service.basket.getBasket();
      setBasket(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load basket';
      setError(errorMessage);
      logger.error({ message: 'Basket refresh failed' }, err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, [service]);

  const addItem = async (line: BasketLine) => {
    if (!service) throw new Error('No platform service available');

    setIsLoading(true);
    setError(null);

    try {
      const updatedBasket = await service.basket.addToBasket(line);
      setBasket(updatedBasket);
      return updatedBasket;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add item';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (productId: string) => {
    if (!service) throw new Error('No platform service available');

    setIsLoading(true);
    setError(null);

    try {
      const updatedBasket = await service.basket.removeFromBasket(productId);
      setBasket(updatedBasket);
      return updatedBasket;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove item';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateItem = async (productId: string, quantity: number) => {
    if (!service) throw new Error('No platform service available');

    setIsLoading(true);
    setError(null);

    try {
      const updatedBasket = await service.basket.updateBasketItem(productId, quantity);
      setBasket(updatedBasket);
      return updatedBasket;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update item';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clear = async () => {
    if (!service) throw new Error('No platform service available');

    setIsLoading(true);
    setError(null);

    try {
      const updatedBasket = await service.basket.clearBasket();
      setBasket(updatedBasket);
      return updatedBasket;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear basket';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const applyDiscount = async (code: string) => {
    if (!service) throw new Error('No platform service available');

    setIsLoading(true);
    setError(null);

    try {
      const updatedBasket = await service.basket.applyDiscount(code);
      setBasket(updatedBasket);
      return updatedBasket;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to apply discount';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    basket,
    isLoading,
    error,
    refresh,
    addItem,
    removeItem,
    updateItem,
    clear,
    applyDiscount,
  };
};
