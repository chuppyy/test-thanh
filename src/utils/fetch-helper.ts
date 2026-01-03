/**
 * Optimized fetch with timeout and retry
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = 5000
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

/**
 * Fetch with retry logic
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries = 2
): Promise<Response> {
  let lastError: Error | null = null;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fetchWithTimeout(url, options);
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries) {
        // Wait before retry with exponential backoff
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, i) * 100)
        );
      }
    }
  }

  throw lastError;
}
