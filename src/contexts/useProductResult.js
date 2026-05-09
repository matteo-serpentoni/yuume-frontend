import { useContext, createContext } from 'react';

/**
 * ProductResultContext — scoped per product-result block.
 *
 * Critical invariant: clicking a product card from search A must
 * always report search A's searchId, even after a new search B
 * has rendered.
 */
export const ProductResultContext = createContext(null);

export function useProductResult() {
  const ctx = useContext(ProductResultContext);
  if (!ctx) throw new Error('useProductResult must be used within ProductResultProvider');
  return ctx;
}
