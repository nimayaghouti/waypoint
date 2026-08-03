export function createRateLimiter(delayMs: number) {
  let lastRequestTime = 0;
  return async function applyRateLimit() {
    const elapsed = Date.now() - lastRequestTime;
    if (elapsed < delayMs) {
      await new Promise(resolve => setTimeout(resolve, delayMs - elapsed));
    }
    lastRequestTime = Date.now();
  };
}
