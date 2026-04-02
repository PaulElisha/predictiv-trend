const API_URL = "https://stock-predictions-ai.vercel.app/api/generate-stock-report";

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

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const token = JSON.parse(line.slice(6));
            onToken(token);
          } catch {
            continue;
          }
        }
      }
    }

    onDone();
  } catch (err: any) {
    if (err.name === "AbortError") return;
    onError(err.message || "Unknown error");
  }
}
