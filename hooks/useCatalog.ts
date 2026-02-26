import { useState, useEffect } from 'react';
import { usePlatform } from '../context/PlatformContext';
import type { Category, KioskCatalog, Product } from '../services/interfaces';
import { useLogger } from './useLogger';

export const useCatalog = () => {
  const { service } = usePlatform();
  const logger = useLogger('useCatalog');
  const [catalog, setCatalog] = useState<KioskCatalog | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCatalog = async () => {
    if (!service) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await service.catalog.getCatalog();
      setCatalog(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load catalog';
      setError(errorMessage);
      logger.error({ message: 'Catalog load failed' }, err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadCatalog();
  }, [service]);

  const getCategories = async (): Promise<Category[]> => {
    if (!service) throw new Error('No platform service available');
    return service.catalog.getCategories();
  };

  const getProducts = async (categoryId?: string): Promise<Product[]> => {
    if (!service) throw new Error('No platform service available');
    return service.catalog.getProducts(categoryId);
  };

  const getProduct = async (id: string): Promise<Product | undefined> => {
    if (!service) throw new Error('No platform service available');
    return service.catalog.getProduct(id);
  };

  const searchProducts = async (query: string): Promise<Product[]> => {
    if (!service) throw new Error('No platform service available');
    return service.catalog.searchProducts(query);
  };

  return {
    catalog,
    isLoading,
    error,
    refresh: loadCatalog,
    getCategories,
    getProducts,
    getProduct,
    searchProducts,
  };
};
