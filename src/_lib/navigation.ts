/**
 * Full-page navigation. A separate module so components can be tested without
 * jsdom's non-navigable window.location getting in the way.
 */
export function redirectTo(url: string): void {
  window.location.href = url;
}
