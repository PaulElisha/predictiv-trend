import { useRef, useEffect, useState } from "react";
import { Brain, Loader2, AlertCircle, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ReportDisplayProps {
  content: string;
  isStreaming: boolean;
  error: string | null;
  hasStarted: boolean;
}

export function ReportDisplay({ content, isStreaming, error, hasStarted }: ReportDisplayProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [content]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (error) {
    return (
      <div className="glass-strong rounded-xl p-6 border-destructive/30 animate-slide-up">
        <div className="flex items-center gap-3 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm font-medium">Analysis Error</p>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          The AI service is temporarily unavailable. This is a server-side issue — please try again in a moment.
        </p>
        <p className="mt-1 text-xs text-muted-foreground/60 font-mono">{error}</p>
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <div className="glass rounded-xl p-12 flex flex-col items-center justify-center text-center min-h-[300px]">
        <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
          <Brain className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">AI Stock Analysis</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Select your tickers and date range, then generate a report. Our AI will analyze
          historical data and provide insights.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-strong rounded-xl overflow-hidden animate-slide-up">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">AI Report</span>
          {isStreaming && (
            <div className="flex items-center gap-1.5 ml-2">
              <Loader2 className="h-3 w-3 animate-spin text-primary" />
              <span className="text-xs text-primary font-mono">streaming...</span>
            </div>
          )}
        </div>
        {content && !isStreaming && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary/50 transition-all"
          >
            {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
        )}
      </div>

      <div ref={scrollRef} className="p-5 max-h-[60vh] overflow-y-auto">
        <div className="prose prose-invert prose-sm max-w-none">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/90 bg-transparent p-0 m-0 border-0">
            {content}
            {isStreaming && (
              <span className="inline-block w-2 h-4 bg-primary ml-0.5 animate-pulse-glow rounded-sm" />
            )}
          </pre>
        </div>
      </div>
    </div>
  );
}
