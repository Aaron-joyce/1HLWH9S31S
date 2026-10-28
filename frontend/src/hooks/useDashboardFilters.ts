import { useState, useMemo, useCallback } from "react";
import type { TimeframeFilter, ChartSeriesToggle, DateRange } from "@/types/analytics";
import type { WindDataPoint } from "@/types/wind";

export function useDashboardFilters(allPoints: WindDataPoint[]) {
  const [timeframe, setTimeframe] = useState<TimeframeFilter>("all");
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: "2026-01-01",
    endDate: "2026-01-31",
  });
  const [seriesToggle, setSeriesToggle] = useState<ChartSeriesToggle>({
    showActual: true,
    showForecast: true,
    showVariance: true,
  });

  const toggleSeries = useCallback((seriesKey: keyof ChartSeriesToggle) => {
    setSeriesToggle((prev) => ({
      ...prev,
      [seriesKey]: !prev[seriesKey],
    }));
  }, []);

  const filteredPoints = useMemo(() => {
    if (!allPoints || allPoints.length === 0) return [];

    let slice = allPoints;

    if (timeframe === "24h") {
      // 48 points of 30-min intervals
      slice = allPoints.slice(-48);
    } else if (timeframe === "7d") {
      // 336 points (7 days * 48)
      slice = allPoints.slice(-336);
    } else if (timeframe === "14d") {
      // 672 points (14 days * 48)
      slice = allPoints.slice(-672);
    } else {
      // "all" or custom date range filter
      if (dateRange.startDate && dateRange.endDate) {
        const startMs = new Date(`${dateRange.startDate}T00:00:00Z`).getTime();
        const endMs = new Date(`${dateRange.endDate}T23:59:59Z`).getTime();
        slice = allPoints.filter((p) => {
          const ptMs = new Date(p.start_time).getTime();
          return !isNaN(ptMs) && ptMs >= startMs && ptMs <= endMs;
        });
      }
    }

    return slice;
  }, [allPoints, timeframe, dateRange]);

  return {
    timeframe,
    setTimeframe,
    dateRange,
    setDateRange,
    seriesToggle,
    toggleSeries,
    filteredPoints,
  };
}
