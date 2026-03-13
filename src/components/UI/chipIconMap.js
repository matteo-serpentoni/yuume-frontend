/**
 * Chip Icon Map — Chip System v2
 *
 * Maps the `icon` field from chip contracts to SVG icon components.
 * Separated from Icons.jsx to satisfy react-refresh/only-export-components.
 */
import {
  PackageIcon,
  ChatIcon,
  ReturnIcon,
  StarIcon,
  TagIcon,
  SearchIcon,
  GridIcon,
  CartIcon,
} from './Icons';

/**
 * Icon map keyed by the `icon` field from the Chip v2 contract.
 * Unknown icon keys gracefully return undefined (no icon rendered).
 */
export const CHIP_ICON_MAP = {
  package: PackageIcon,
  chat: ChatIcon,
  return: ReturnIcon,
  star: StarIcon,
  tag: TagIcon,
  search: SearchIcon,
  grid: GridIcon,
  cart: CartIcon,
};
