import { useMemo } from 'react';
import { ProductResultContext } from './useProductResult';

/**
 * @param {Object} props.value
 * @param {string|null} props.value.searchId
 * @param {string|null} props.value.messageId
 * @param {string|null} props.value.query
 */
export function ProductResultProvider({ children, value }) {
  const ctx = useMemo(
    () => value,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value.searchId, value.messageId, value.query],
  );
  return <ProductResultContext.Provider value={ctx}>{children}</ProductResultContext.Provider>;
}
