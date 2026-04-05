const API_URL = "https://predictive-trend-api.onrender.com/api/generate-stock-report";

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
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
      signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      onError(`API error: ${response.status} — ${errorText}`);
      return;
    }

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
        if (part.startsWith("data: ")) {
          try {
            const token = JSON.parse(part.slice(6));
            batchBuffer += token;
          } catch {
            continue;
          }
        }
      }

      // Batch DOM updates to animation frames for smooth rendering
      if (batchBuffer && rafId === null) {
        rafId = requestAnimationFrame(flush);
      }
    }

    // Flush any remaining tokens
    if (rafId !== null) cancelAnimationFrame(rafId);
    flush();

    onDone();
  } catch (err: any) {
    if (err.name === "AbortError") return;
    onError(err.message || "Unknown error");
  }
}
