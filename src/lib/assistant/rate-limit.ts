import "server-only";

// Simple fixed-window per-user request limit. This is process-local, in-memory
// state: it resets on server restart and does not share state across multiple
// server instances or edge/serverless workers. That is an accepted limit of
// this architecture; a production deployment behind multiple instances would
// need a shared store (e.g. the database or Redis) instead.
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 10;

const requestLog = new Map<string, number[]>();

export function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  const timestamps = (requestLog.get(userId) ?? []).filter((t) => t > windowStart);

  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    requestLog.set(userId, timestamps);
    return true;
  }

  timestamps.push(now);
  requestLog.set(userId, timestamps);
  return false;
}
