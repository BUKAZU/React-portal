/** How the search results are laid out. */
export type ViewMode = 'grid' | 'list';

const STORAGE_KEY = 'bukazuViewMode';

export function isViewMode(value: unknown): value is ViewMode {
  return value === 'grid' || value === 'list';
}

/**
 * The visitor's previously chosen results layout, or null when none (or an
 * unknown value) was stored. Storage can throw in embedded contexts, which
 * counts as "nothing stored".
 */
export function readStoredViewMode(): ViewMode | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isViewMode(stored) ? stored : null;
  } catch {
    return null;
  }
}

/** Remember the visitor's chosen layout; storage failures are ignored. */
export function storeViewMode(mode: ViewMode): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // Storage is a convenience; the choice still lives in component state.
  }
}
