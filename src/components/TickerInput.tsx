import { useState, useCallback } from "react";
import { X, Plus, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const POPULAR_TICKERS = ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA", "NVDA", "META", "NFLX"];

interface TickerInputProps {
  tickers: string[];
  onChange: (tickers: string[]) => void;
  disabled?: boolean;
}

export function TickerInput({ tickers, onChange, disabled }: TickerInputProps) {
  const [inputValue, setInputValue] = useState("");

  const addTicker = useCallback(
    (ticker: string) => {
      const clean = ticker.toUpperCase().trim();
      if (clean && !tickers.includes(clean) && tickers.length < 5) {
        onChange([...tickers, clean]);
      }
      setInputValue("");
    },
    [tickers, onChange],
  );

  const removeTicker = (ticker: string) => {
    onChange(tickers.filter((t) => t !== ticker));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTicker(inputValue);
    }
    if (e.key === "Backspace" && !inputValue && tickers.length > 0) {
      onChange(tickers.slice(0, -1));
    }
  };

  const suggestedTickers = POPULAR_TICKERS.filter((t) => !tickers.includes(t));

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-primary" />
        Stock Tickers
      </label>

      <div className="glass-strong rounded-lg p-3 focus-within:ring-1 focus-within:ring-primary/50 transition-all">
        <div className="flex flex-wrap gap-2 mb-2">
          {tickers.map((ticker) => (
            <Badge
              key={ticker}
              variant="default"
              className="px-3 py-1.5 text-sm font-mono font-semibold gap-1.5 animate-slide-up"
            >
              {ticker}
              {!disabled && (
                <button
                  onClick={() => removeTicker(ticker)}
                  className="ml-1 hover:opacity-70 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>

        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value.toUpperCase())}
          onKeyDown={handleKeyDown}
          placeholder={tickers.length === 0 ? "Type a ticker (e.g., AAPL) and press Enter" : "Add another ticker..."}
          disabled={disabled || tickers.length >= 5}
          className="border-0 bg-transparent p-0 h-8 text-sm font-mono focus-visible:ring-0 placeholder:text-muted-foreground/50"
        />
      </div>

      {tickers.length < 5 && !disabled && (
        <div className="flex flex-wrap gap-1.5">
          {suggestedTickers.slice(0, 6).map((ticker) => (
            <button
              key={ticker}
              onClick={() => addTicker(ticker)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono text-muted-foreground rounded-md border border-border/50 hover:border-primary/40 hover:text-primary transition-all bg-secondary/30"
            >
              <Plus className="h-3 w-3" />
              {ticker}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
