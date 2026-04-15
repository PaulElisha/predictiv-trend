import { useState, useCallback, useRef, useEffect } from "react";
import { format } from "date-fns";
import { Zap, BarChart3, Activity, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TickerInput } from "@/components/TickerInput";
import { DateRangeSelector } from "@/components/DateRangeSelector";
import { ReportDisplay } from "@/components/ReportDisplay";
import { streamStockReport } from "@/lib/api";
import { toast } from "sonner";

const Index = () => {
  const [tickers, setTickers] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [report, setReport] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const canGenerate = tickers.length > 0 && startDate && endDate && !isStreaming;

  const handleGenerate = useCallback(async () => {
    if (!startDate || !endDate || tickers.length === 0) return;

    abortRef.current = new AbortController();
    setReport("");
    setError(null);
    setIsStreaming(true);
    setHasStarted(true);

    await streamStockReport(
      {
        tickersArr: tickers,
        dates: {
          startDate: format(startDate, "yyyy-MM-dd"),
          endDate: format(endDate, "yyyy-MM-dd"),
        },
      },
      (token) => setReport((prev) => prev + token),
      () => setIsStreaming(false),
      (err) => {
        setError(err);
        setIsStreaming(false);
      },
      abortRef.current.signal,
    );
  }, [tickers, startDate, endDate]);

  const handleStop = () => {
    abortRef.current?.abort();
    setIsStreaming(false);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-info/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/[0.02] rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border/50">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center glow-primary">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-foreground">
                  Predictiv<span className="gradient-text">Trend</span>
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              Live
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-6xl mx-auto px-6 py-8">
          {/* Hero */}
          <div className="mb-10 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
              AI-Powered Stock
              <br />
              <span className="gradient-text">Market Analysis</span>
            </h2>
            <p className="text-muted-foreground max-w-lg">
              Get intelligent insights on stock performance powered by Mistral AI.
              Select tickers and a time range to generate your report.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Controls panel */}
            <div className="lg:col-span-4 space-y-6">
              <div className="glass-strong rounded-xl p-6 space-y-6 animate-slide-up">
                <TickerInput
                  tickers={tickers}
                  onChange={setTickers}
                  disabled={isStreaming}
                />

                <div className="h-px bg-border/50" />

                <DateRangeSelector
                  startDate={startDate}
                  endDate={endDate}
                  onStartDateChange={setStartDate}
                  onEndDateChange={setEndDate}
                  disabled={isStreaming}
                />

                <div className="h-px bg-border/50" />

                {isStreaming ? (
                  <div className="flex gap-2 w-full">
                    <Button
                      variant="glow"
                      className="flex-1 h-12 text-sm font-semibold pointer-events-none"
                      disabled
                    >
                      <div className="h-4 w-4 mr-2 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Generating...
                    </Button>
                    <button
                      onClick={handleStop}
                      className="h-12 w-12 rounded-lg border border-border/50 bg-secondary/50 hover:bg-secondary flex items-center justify-center transition-colors"
                      title="Stop generation"
                    >
                      <Square className="h-3.5 w-3.5 text-foreground fill-foreground" />
                    </button>
                  </div>
                ) : (
                  <Button
                    variant="glow"
                    className="w-full h-12 text-sm font-semibold"
                    onClick={handleGenerate}
                    disabled={!canGenerate}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                )}
              </div>

              {/* Stats cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="glass rounded-lg p-4 text-center">
                  <BarChart3 className="h-4 w-4 text-primary mx-auto mb-1.5" />
                  <p className="text-2xl font-bold font-mono text-foreground">
                    {tickers.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Tickers</p>
                </div>
                <div className="glass rounded-lg p-4 text-center">
                  <Activity className="h-4 w-4 text-primary mx-auto mb-1.5" />
                  <p className="text-2xl font-bold font-mono text-foreground">
                    {startDate && endDate
                      ? Math.ceil(
                          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
                        )
                      : 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Days</p>
                </div>
              </div>
            </div>

            {/* Report panel */}
            <div className="lg:col-span-8">
              <ReportDisplay
                content={report}
                isStreaming={isStreaming}
                error={error}
                hasStarted={hasStarted}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
