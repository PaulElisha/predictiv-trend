const API_URL = "https://predictive-trend-api.onrender.com/api/generate-stock-report";

const MAX_RETRIES = 3;
const BASE_RETRY_DELAY = 1000;

export interface StockReportParams {
  tickersArr: string[];
  dates: {
    startDate: string;
    endDate: string;
  };
}

export async function streamStockReport(
  params: StockReportParams,
  onToken: (token: string) => void,
  onDone: () => void,
  onError: (error: string) => void,
  signal?: AbortSignal,
) {
  let retries = 0;
  let accumulated = "";

  const attempt = async (): Promise<void> => {
    try {
      if (signal?.aborted) return;

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
        signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        // Retriable server errors (5xx)
        if (response.status >= 500 && retries < MAX_RETRIES) {
          retries++;
          const delay = BASE_RETRY_DELAY * Math.pow(2, retries - 1);
          await new Promise((r) => setTimeout(r, delay));
          return attempt();
        }
        onError(`API error: ${response.status} — ${errorText}`);
        return;
      }

      // Reset retries on successful connection
      retries = 0;

      const reader = response.body?.getReader();
      if (!reader) {
        onError("No response stream available");
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";
      let batchBuffer = "";
      let rafId: number | null = null;

      const flush = () => {
        if (batchBuffer) {
          accumulated += batchBuffer;
          onToken(batchBuffer);
          batchBuffer = "";
        }
        rafId = null;
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          for (const line of part.split("\n")) {
            if (line.startsWith("data: ")) {
              const payload = line.slice(6);
              if (payload === "[DONE]") {
                // Server signals completion
                if (rafId !== null) cancelAnimationFrame(rafId);
                flush();
                onDone();
                return;
              }
              try {
                const token = JSON.parse(payload);
                batchBuffer += token;
              } catch {
                // Non-JSON data line, append raw
                batchBuffer += payload;
              }
            }
            // Silently ignore comment lines (":") and unknown fields
          }
        }

        if (batchBuffer && rafId === null) {
          rafId = requestAnimationFrame(flush);
        }
      }

      // Stream ended normally
      if (rafId !== null) cancelAnimationFrame(rafId);
      flush();
      onDone();
    } catch (err: any) {
      if (err.name === "AbortError") return;

      // Retry on network failures
      if (retries < MAX_RETRIES) {
        retries++;
        const delay = BASE_RETRY_DELAY * Math.pow(2, retries - 1);
        await new Promise((r) => setTimeout(r, delay));
        return attempt();
      }

      onError(err.message || "Unknown error");
    }
  };

  await attempt();
}
