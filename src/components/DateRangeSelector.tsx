import { useState, useRef, useEffect } from "react";
import { format, subDays, subMonths, subYears } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const PRESETS = [
  { label: "7D", days: 7 },
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
  { label: "6M", days: 180 },
  { label: "1Y", days: 365 },
] as const;

interface DateRangeSelectorProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  disabled?: boolean;
}

export function DateRangeSelector({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  disabled,
}: DateRangeSelectorProps) {
  const [activePreset, setActivePreset] = useState<string | null>("3M");

  const handlePreset = (label: string, days: number) => {
    const end = new Date();
    const start = subDays(end, days);
    onStartDateChange(start);
    onEndDateChange(end);
    setActivePreset(label);
  };

  // Set default 3M on mount
  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current && !startDate && !endDate) {
      initialized.current = true;
      const end = new Date();
      const start = subDays(end, 90);
      onStartDateChange(start);
      onEndDateChange(end);
    }
  }, []);

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground flex items-center gap-2">
        <CalendarIcon className="h-4 w-4 text-primary" />
        Date Range
      </label>

      <div className="flex gap-1.5">
        {PRESETS.map(({ label, days }) => (
          <Button
            key={label}
            variant={activePreset === label ? "default" : "ghost-muted" as any}
            size="sm"
            onClick={() => handlePreset(label, days)}
            disabled={disabled}
            className={cn(
              "text-xs font-mono px-3 h-8",
              activePreset === label && "glow-primary"
            )}
          >
            {label}
          </Button>
        ))}
      </div>

      <div className="flex gap-3">
        <DatePicker
          label="From"
          date={startDate}
          onSelect={(d) => {
            onStartDateChange(d);
            setActivePreset(null);
          }}
          disabled={disabled}
          maxDate={endDate}
        />
        <DatePicker
          label="To"
          date={endDate}
          onSelect={(d) => {
            onEndDateChange(d);
            setActivePreset(null);
          }}
          disabled={disabled}
          maxDate={new Date()}
        />
      </div>
    </div>
  );
}

function DatePicker({
  label,
  date,
  onSelect,
  disabled,
  maxDate,
}: {
  label: string;
  date: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  disabled?: boolean;
  maxDate?: Date;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "flex-1 justify-start text-left font-normal h-10 glass-strong",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
          {date ? (
            <span className="font-mono text-sm">{format(date, "yyyy-MM-dd")}</span>
          ) : (
            <span className="text-sm">{label}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 glass-strong" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onSelect}
          disabled={(d) => (maxDate ? d > maxDate : false) || d > new Date()}
          initialFocus
          className="p-3 pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
}
