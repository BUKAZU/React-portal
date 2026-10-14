type Stay = { arrival: string; departure: string };

// Page-load wide: a remount, or another component showing the same thing, must
// not count it again.
const tracked = new Set<string>();

function firstTime(key: string): boolean {
  if (tracked.has(key)) return false;
  tracked.add(key);
  return true;
}

export function firstHouseView(houseCode: string): boolean {
  return firstTime(`house_view:${houseCode}`);
}

export function firstPriceUnavailable(houseCode: string, stay: Stay): boolean {
  return firstTime(
    `price_unavailable:${houseCode}:${stay.arrival}:${stay.departure}`
  );
}

export function firstQuote(
  houseCode: string,
  stay: Stay,
  persons: number
): boolean {
  return firstTime(
    `quote_shown:${houseCode}:${stay.arrival}:${stay.departure}:${persons}`
  );
}

/** Test hook: forget everything tracked so far. */
export function resetTrackOnce(): void {
  tracked.clear();
}
