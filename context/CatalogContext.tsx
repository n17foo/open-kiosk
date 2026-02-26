import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { VariantGroup, KioskCatalog, Product, UpgradeOffer } from '../services/types';
import { usePlatform } from './PlatformContext';

interface CatalogContextValue extends KioskCatalog {
  isLoading: boolean;
  refresh: () => Promise<void>;
  getProductById: (id: string) => Product | undefined;
  getUpgradeById: (id: string) => UpgradeOffer | undefined;
  getVariantGroupById: (id: string) => VariantGroup | undefined;
}

const initialCatalog: KioskCatalog = {
  categories: [],
  products: [],
  upgradeOffers: [],
  variantGroups: [],
};

const CatalogContext = createContext<CatalogContextValue | undefined>(undefined);

// Internal component that uses hooks
const CatalogProviderInner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { service } = usePlatform();
  const [catalog, setCatalog] = useState<KioskCatalog>(initialCatalog);
  const [isLoading, setIsLoading] = useState(true);

  const loadCatalog = useCallback(async () => {
    if (!service) return;

    setIsLoading(true);
    try {
      const data = await service.catalog.getCatalog();
      setCatalog(data);
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  const value = useMemo<CatalogContextValue>(
    () => ({
      ...catalog,
      isLoading,
      refresh: loadCatalog,
      getProductById: (id: string) => catalog.products.find(product => product.id === id),
      getUpgradeById: (id: string) => catalog.upgradeOffers.find(offer => offer.id === id),
      getVariantGroupById: (id: string) => catalog.variantGroups.find(group => group.id === id),
    }),
    [catalog, isLoading, loadCatalog]
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
};

export const CatalogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <CatalogProviderInner>{children}</CatalogProviderInner>;
};

export const useCatalog = () => {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error('useCatalog must be used within a CatalogProvider');
  }
  return context;
};
