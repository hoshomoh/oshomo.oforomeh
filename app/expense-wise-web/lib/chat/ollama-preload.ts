/**
 * Ollama model preloading utility
 * Sends a minimal request to load the model into memory, avoiding the initial delay
 */

type PreloadOptions = {
  model: string;
  baseUrl?: string;
};

type PreloadResult = {
  success: boolean;
  error?: string;
  loadTimeMs?: number;
};

/**
 * Preload an Ollama model by sending a minimal chat completion request.
 * This loads the model into memory so the first real request is faster.
 *
 * @param options - Model name and optional base URL
 * @returns Promise with success status and timing
 */
export async function preloadOllamaModel({
  model,
  baseUrl = 'http://localhost:11434',
}: PreloadOptions): Promise<PreloadResult> {
  console.log(`[Ollama Preload] Starting preload for model: ${model}`);
  const startTime = performance.now();

  try {
    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'hi' }],
        max_tokens: 1, // Minimal response to just load the model
        stream: false,
      }),
      // Add a timeout in case the model takes too long to load
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    const loadTimeMs = performance.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`[Ollama Preload] Failed (${loadTimeMs.toFixed(0)}ms): HTTP ${response.status}`);
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorText}`,
        loadTimeMs,
      };
    }

    console.log(`[Ollama Preload] ✓ Success! Model loaded in ${loadTimeMs.toFixed(0)}ms`);
    return {
      success: true,
      loadTimeMs,
    };
  } catch (error) {
    const loadTimeMs = performance.now() - startTime;

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.warn(`[Ollama Preload] Timeout after ${loadTimeMs.toFixed(0)}ms`);
        return {
          success: false,
          error: 'Preload timeout (30s) - model may be too large or Ollama is slow',
          loadTimeMs,
        };
      }

      console.warn(`[Ollama Preload] Error (${loadTimeMs.toFixed(0)}ms):`, error.message);
      return {
        success: false,
        error: error.message,
        loadTimeMs,
      };
    }

    console.warn(`[Ollama Preload] Unknown error (${loadTimeMs.toFixed(0)}ms)`);
    return {
      success: false,
      error: 'Unknown error during preload',
      loadTimeMs,
    };
  }
}

/**
 * Check if Ollama is reachable at the given base URL.
 * Useful for validating the connection before attempting preload.
 */
export async function checkOllamaConnection(baseUrl = 'http://localhost:11434'): Promise<boolean> {
  try {
    const response = await fetch(`${baseUrl}/api/tags`, {
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
