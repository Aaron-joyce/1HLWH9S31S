import type { ForecastHorizon } from "@/types/wind";
import { Lightning, ClockCountdown } from "@phosphor-icons/react";

interface ForecastHorizonToggleProps {
  horizon: ForecastHorizon;
  onChangeHorizon: (horizon: ForecastHorizon) => void;
  dayAheadRmse?: number;
  intradayRmse?: number;
  className?: string;
}

export function ForecastHorizonToggle({
  horizon,
  onChangeHorizon,
  dayAheadRmse,
  intradayRmse,
  className = "",
}: ForecastHorizonToggleProps) {
  return (
    <div
      className={`inline-flex items-center p-0.5 rounded-md border border-border/80 bg-background/90 text-xs shadow-2xs ${className}`}
      role="group"
      aria-label="Forecast Horizon"
    >
      <button
        type="button"
        onClick={() => onChangeHorizon("day-ahead")}
        className={`flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer select-none ${
          horizon === "day-ahead"
            ? "bg-primary/15 text-primary shadow-2xs border border-primary/25"
            : "text-muted-foreground hover:text-foreground border border-transparent"
        }`}
        title="Day-Ahead (D-1): Published prior to 00:00 UTC delivery day for wholesale market trading"
      >
        <Lightning
          size={13}
          className={horizon === "day-ahead" ? "text-primary" : "text-muted-foreground"}
          weight={horizon === "day-ahead" ? "fill" : "regular"}
        />
        <span>Day-Ahead (D-1)</span>
        {dayAheadRmse !== undefined && (
          <span
            className={`font-mono text-[10px] ml-0.5 ${
              horizon === "day-ahead" ? "text-primary font-bold" : "text-muted-foreground"
            }`}
          >
            {dayAheadRmse.toFixed(1)} MW
          </span>
        )}
      </button>

      <button
        type="button"
        onClick={() => onChangeHorizon("intraday")}
        className={`flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer select-none ${
          horizon === "intraday"
            ? "bg-primary/15 text-primary shadow-2xs border border-primary/25"
            : "text-muted-foreground hover:text-foreground border border-transparent"
        }`}
        title="Intraday (Pre-Gate): Latest forecast published prior to settlement interval start"
      >
        <ClockCountdown
          size={13}
          className={horizon === "intraday" ? "text-primary" : "text-muted-foreground"}
          weight={horizon === "intraday" ? "bold" : "regular"}
        />
        <span>Intraday (Pre-Gate)</span>
        {intradayRmse !== undefined && (
          <span
            className={`font-mono text-[10px] ml-0.5 ${
              horizon === "intraday" ? "text-primary font-bold" : "text-muted-foreground"
            }`}
          >
            {intradayRmse.toFixed(1)} MW
          </span>
        )}
      </button>
    </div>
  );
}
