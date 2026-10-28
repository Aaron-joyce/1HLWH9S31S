import type { ReactNode } from "react";
import { formatMW } from "@/lib/utils";

interface TooltipPayloadItem {
  name?: string;
  value?: number | string | null;
  color?: string;
  dataKey?: string | number;
  unit?: string;
  stroke?: string;
  fill?: string;
}

interface CustomChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: ReactNode;
  titleFormatter?: (label: ReactNode) => string;
  valueFormatter?: (value: number | string | null | undefined, name?: string) => string;
}

export function CustomChartTooltip({
  active,
  payload,
  label,
  titleFormatter,
  valueFormatter,
}: CustomChartTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const formatTitle = (rawLabel: ReactNode): string => {
    if (titleFormatter) return titleFormatter(rawLabel);
    if (typeof rawLabel === "string" || typeof rawLabel === "number") {
      try {
        const d = new Date(rawLabel);
        if (!isNaN(d.getTime())) {
          return d.toLocaleString("en-GB", {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });
        }
      } catch {
        return String(rawLabel);
      }
      return String(rawLabel);
    }
    return "";
  };

  const title = formatTitle(label);

  return (
    <div className="z-50 min-w-[200px] overflow-hidden rounded-lg border border-border/80 bg-card/95 p-3 text-xs shadow-xl backdrop-blur-md transition-all">
      {title ? (
        <div className="mb-2 border-b border-border/60 pb-1.5 font-medium text-foreground">
          {title}
        </div>
      ) : null}
      <div className="space-y-1.5">
        {payload.map((entry, index) => {
          const itemColor = entry.color || entry.stroke || entry.fill || "var(--color-primary)";
          const isMissing = entry.value === null || entry.value === undefined;
          const formattedValue = valueFormatter
            ? valueFormatter(entry.value, entry.name)
            : typeof entry.value === "number"
            ? formatMW(entry.value)
            : "—";

          return (
            <div
              key={`tooltip-item-${index}`}
              className="flex items-center justify-between gap-4 font-mono text-xs"
            >
              <div className="flex items-center gap-1.5 truncate text-muted-foreground">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: itemColor }}
                />
                <span className="truncate">{entry.name || entry.dataKey}</span>
              </div>
              <span
                className={`tabular-nums ${
                  isMissing
                    ? "text-muted-foreground/70 font-normal italic text-[11px]"
                    : "font-semibold text-foreground"
                }`}
              >
                {isMissing ? "No data" : formattedValue}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
