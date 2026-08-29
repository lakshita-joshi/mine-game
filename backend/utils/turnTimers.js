const timers = new Map();
export const TURN_TIMEOUT_MS = 30000;

export function scheduleTurnTimeout(tableId, onTimeout) {
  clearTurnTimeout(tableId);
  const handle = setTimeout(onTimeout, TURN_TIMEOUT_MS);
  timers.set(tableId.toString(), handle);
}

export function clearTurnTimeout(tableId) {
  const existing = timers.get(tableId.toString());
  if (existing) clearTimeout(existing);
  timers.delete(tableId.toString());
}