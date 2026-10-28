import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { DateRange } from "@/types/analytics";
import { CalendarBlank, CaretDown } from "@phosphor-icons/react";

interface DateRangeSelectorProps {
  dateRange: DateRange;
  onChangeDateRange: (range: DateRange) => void;
  className?: string;
}

function formatDateRangeLabel(startStr: string, endStr: string): string {
  try {
    const start = new Date(`${startStr}T00:00:00Z`);
    const end = new Date(`${endStr}T00:00:00Z`);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return `${startStr} – ${endStr}`;
    }
    const startFormatted = start.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
    const endFormatted = end.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
    return `${startFormatted} – ${endFormatted}`;
  } catch {
    return `${startStr} – ${endStr}`;
  }
}

export function DateRangeSelector({
  dateRange,
  onChangeDateRange,
  className = "",
}: DateRangeSelectorProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempStart, setTempStart] = useState(dateRange.startDate);
  const [tempEnd, setTempEnd] = useState(dateRange.endDate);
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
        setShowDatePicker(false);
      }
    };
    if (showDatePicker) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDatePicker]);

  return (
    <div className={`relative ${className}`} ref={datePickerRef}>
      <button
        type="button"
        onClick={() => {
          setTempStart(dateRange.startDate);
          setTempEnd(dateRange.endDate);
          setShowDatePicker((prev) => !prev);
        }}
        className="flex items-center gap-2 rounded-md border border-border/80 bg-background/90 hover:bg-muted/50 px-3 py-1.5 text-xs font-semibold text-foreground shadow-2xs transition-all cursor-pointer select-none"
        title="Click to select custom date range"
      >
        <CalendarBlank size={14} className="text-primary" />
        <span>{formatDateRangeLabel(dateRange.startDate, dateRange.endDate)}</span>
        <CaretDown
          size={11}
          className={`text-muted-foreground transition-transform duration-200 ${
            showDatePicker ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Popover Date Range Picker */}
      {showDatePicker && (
        <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-72 rounded-xl border border-border/80 bg-popover p-3.5 text-popover-foreground shadow-xl z-50 animate-in fade-in-0 zoom-in-95 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-border/50 font-semibold text-foreground">
            <div className="flex items-center gap-1.5">
              <CalendarBlank size={14} className="text-primary" />
              <span>Select Date Range</span>
            </div>
          </div>

          <div className="py-3 space-y-2.5">
            <div>
              <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                From Date
              </label>
              <input
                type="date"
                value={tempStart}
                min="2026-01-01"
                max={tempEnd || "2026-01-31"}
                onChange={(e) => setTempStart(e.target.value)}
                className="w-full rounded-md border border-border/60 bg-muted/40 px-2.5 py-1.5 text-xs font-mono text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                To Date
              </label>
              <input
                type="date"
                value={tempEnd}
                min={tempStart || "2026-01-01"}
                max="2026-01-31"
                onChange={(e) => setTempEnd(e.target.value)}
                className="w-full rounded-md border border-border/60 bg-muted/40 px-2.5 py-1.5 text-xs font-mono text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/50 gap-2">
            <button
              type="button"
              onClick={() => {
                setTempStart("2026-01-01");
                setTempEnd("2026-01-31");
                onChangeDateRange({ startDate: "2026-01-01", endDate: "2026-01-31" });
                setShowDatePicker(false);
              }}
              className="text-[11px] text-muted-foreground hover:text-foreground font-medium underline underline-offset-2"
            >
              Reset (Jan 2026)
            </button>
            <Button
              type="button"
              size="sm"
              className="h-7 text-xs px-3"
              onClick={() => {
                if (tempStart && tempEnd) {
                  onChangeDateRange({ startDate: tempStart, endDate: tempEnd });
                  setShowDatePicker(false);
                }
              }}
            >
              Apply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
