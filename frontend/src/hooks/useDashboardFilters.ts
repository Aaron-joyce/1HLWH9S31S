import { useState, useMemo, useCallback } from "react";
import type { TimeframeFilter, ChartSeriesToggle, DateRange } from "@/types/analytics";
import type { WindDataPoint, ForecastHorizon } from "@/types/wind";

export function useDashboardFilters(allPoints: WindDataPoint[]) {
  const [timeframe, setTimeframe] = useState<TimeframeFilter>("all");
  const [forecastHorizon, setForecastHorizon] = useState<ForecastHorizon>("day-ahead");
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

  const projectedPoints = useMemo(() => {
    const mapped = allPoints.map((p) => {
      let forecastGen: number | null = p.forecast_generation;
      let forecastPub: string | null = p.forecast_publish_time ?? null;

      if (forecastHorizon === "day-ahead") {
        forecastGen = p.forecast_day_ahead_generation ?? p.forecast_generation;
        forecastPub = p.forecast_day_ahead_publish_time ?? p.forecast_publish_time ?? null;
      } else {
        forecastGen = p.forecast_intraday_generation ?? p.forecast_generation;
        forecastPub = p.forecast_intraday_publish_time ?? p.forecast_publish_time ?? null;
      }

      return {
        ...p,
        forecast_generation: forecastGen,
        forecast_publish_time: forecastPub,
      };
    });

    // Remove nulls so every rendered interval has valid actual, forecast, and delta values
    return mapped.filter(
      (p) => p.actual_generation !== null && p.forecast_generation !== null
    );
  }, [allPoints, forecastHorizon]);

  const filteredPoints = useMemo(() => {
    if (!projectedPoints || projectedPoints.length === 0) return [];

    let slice = projectedPoints;

    if (timeframe === "24h") {
      // 48 points of 30-min intervals
      slice = projectedPoints.slice(-48);
    } else if (timeframe === "7d") {
      // 336 points (7 days * 48)
      slice = projectedPoints.slice(-336);
    } else if (timeframe === "14d") {
      // 672 points (14 days * 48)
      slice = projectedPoints.slice(-672);
    } else {
      // "all" or custom date range filter
      if (dateRange.startDate && dateRange.endDate) {
        const startMs = new Date(`${dateRange.startDate}T00:00:00Z`).getTime();
        const endMs = new Date(`${dateRange.endDate}T23:59:59Z`).getTime();
        slice = projectedPoints.filter((p) => {
          const ptMs = new Date(p.start_time).getTime();
          return !isNaN(ptMs) && ptMs >= startMs && ptMs <= endMs;
        });
      }
    }

    return slice;
  }, [projectedPoints, timeframe, dateRange]);

  return {
    timeframe,
    setTimeframe,
    forecastHorizon,
    setForecastHorizon,
    dateRange,
    setDateRange,
    seriesToggle,
    toggleSeries,
    filteredPoints,
  };
}
