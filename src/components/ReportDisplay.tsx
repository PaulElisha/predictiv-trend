import { useRef, useEffect, useState, memo, useMemo, lazy, Suspense } from "react";
import { Brain, Loader2, AlertCircle, Copy, Check } from "lucide-react";

const ReactMarkdown = lazy(() => import("react-markdown"));

interface ReportDisplayProps {
  content: string;
  isStreaming: boolean;
  error: string | null;
  hasStarted: boolean;
}

export const ReportDisplay = memo(function ReportDisplay({
  content,
  isStreaming,
  error,
  hasStarted,
}: ReportDisplayProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const isAutoScrolling = useRef(true);

  useEffect(() => {
    const el = scrollRef.current;
    if (el && isAutoScrolling.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [content]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    isAutoScrolling.current = atBottom;
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderedMarkdown = useMemo(
    () => (
      <Suspense fallback={<div className="text-muted-foreground text-sm">Loading...</div>}>
        <ReactMarkdown>{content}</ReactMarkdown>
      </Suspense>
    ),
    [content],
  );

  if (error) {
    return (
      <div className="glass-strong rounded-xl p-6 border-destructive/30 animate-slide-up">
        <div className="flex items-center gap-3 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm font-medium">Analysis Error</p>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          The AI service is temporarily unavailable. Please try again in a moment.
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

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="p-6 max-h-[60vh] overflow-y-auto"
      >
        <div className="prose prose-invert prose-sm max-w-none
          prose-headings:text-foreground prose-headings:font-semibold prose-headings:tracking-tight
          prose-h2:text-lg prose-h2:mt-6 prose-h2:mb-3 prose-h2:pb-2 prose-h2:border-b prose-h2:border-border/40
          prose-h3:text-base prose-h3:mt-5 prose-h3:mb-2
          prose-p:text-foreground/85 prose-p:leading-relaxed prose-p:mb-3
          prose-strong:text-primary prose-strong:font-semibold
          prose-em:text-muted-foreground prose-em:italic
          prose-hr:border-border/40 prose-hr:my-5
          prose-li:text-foreground/85 prose-li:marker:text-primary
          prose-ol:pl-4 prose-ul:pl-4
          prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono-code
          prose-blockquote:border-primary/40 prose-blockquote:text-muted-foreground
        ">
          {renderedMarkdown}
          {isStreaming && (
            <span className="inline-block w-2 h-4 bg-primary ml-0.5 animate-pulse-glow rounded-sm" />
          )}
        </div>
      </div>
    </div>
  );
});
