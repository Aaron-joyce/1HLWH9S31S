import { useState, useEffect, useCallback, useMemo } from "react";
import type { WindDataResponse, ComputedWindAnalytics, WindDataPoint } from "@/types/wind";

interface UseWindDataState {
  data: WindDataResponse | null;
  analytics: ComputedWindAnalytics | null;
  loading: boolean;
  error: string | null;
  isRetrying: boolean;
  retryAttempt: number;
  maxRetries: number;
  lastFetchedAt: Date | null;
  refetch: () => Promise<void>;
}

const API_ENDPOINT =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1/wind-data";
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;

export function computeAnalytics(
  input: WindDataResponse | WindDataPoint[],
  fallbackRmse?: number
): ComputedWindAnalytics {
  const points = Array.isArray(input) ? input : input.data;
  const validPairs = points.filter(
    (p) => p.actual_generation !== null && p.forecast_generation !== null
  );

  let sumActual = 0;
  let sumForecast = 0;
  let sumAbsError = 0;
  let sumSquaredError = 0;
  let peakActual = 0;
  let peakForecast = 0;

  // Distribution buckets
  let severeUnder = 0;
  let modUnder = 0;
  let onTarget = 0;
  let modOver = 0;
  let severeOver = 0;

  // Hourly aggregation (0 - 23)
  const hourlyData: Record<
    number,
    { count: number; sumActual: number; sumForecast: number }
  > = {};

  for (let i = 0; i < 24; i++) {
    hourlyData[i] = { count: 0, sumActual: 0, sumForecast: 0 };
  }

  for (const p of points) {
    const act = p.actual_generation;
    const fcast = p.forecast_generation;

    if (act !== null) {
      sumActual += act;
      if (act > peakActual) peakActual = act;
    }
    if (fcast !== null) {
      sumForecast += fcast;
      if (fcast > peakForecast) peakForecast = fcast;
    }

    if (act !== null && fcast !== null) {
      const delta = act - fcast;
      sumAbsError += Math.abs(delta);
      sumSquaredError += delta * delta;

      if (delta > 1000) severeUnder++;
      else if (delta > 200) modUnder++;
      else if (delta >= -200) onTarget++;
      else if (delta >= -1000) modOver++;
      else severeOver++;
    }

    try {
      const date = new Date(p.start_time);
      const hour = date.getUTCHours();
      if (!isNaN(hour) && hourlyData[hour]) {
        hourlyData[hour].count++;
        if (act !== null) hourlyData[hour].sumActual += act;
        if (fcast !== null) hourlyData[hour].sumForecast += fcast;
      }
    } catch {
      // Ignore invalid date strings
    }
  }

  const validCount = validPairs.length || 1;
  const avgActual = points.length ? sumActual / points.length : 0;
  const avgForecast = points.length ? sumForecast / points.length : 0;
  const mae = sumAbsError / validCount;

  // Each point is a 30-minute interval (0.5 hour)
  const totalActualMWh = sumActual * 0.5;
  const totalForecastMWh = sumForecast * 0.5;
  const overallVarianceMWh = totalActualMWh - totalForecastMWh;

  const accuracyRate = avgActual > 0 ? Math.max(0, 100 - (mae / avgActual) * 100) : 0;

  // Latest non-null readings
  let latestActual: number | null = null;
  let latestForecast: number | null = null;

  for (let i = points.length - 1; i >= 0; i--) {
    if (latestActual === null && points[i].actual_generation !== null) {
      latestActual = points[i].actual_generation;
    }
    if (latestForecast === null && points[i].forecast_generation !== null) {
      latestForecast = points[i].forecast_generation;
    }
    if (latestActual !== null && latestForecast !== null) break;
  }

  const distributionTotal = validPairs.length || 1;
  const varianceDistribution = [
    {
      category: "Severe Under-Forecast (>1000 MW)",
      count: severeUnder,
      percentage: Number(((severeUnder / distributionTotal) * 100).toFixed(1)),
      color: "oklch(0.577 0.245 27.325)", // Destructive/Rose
    },
    {
      category: "Moderate Under-Forecast (200-1000 MW)",
      count: modUnder,
      percentage: Number(((modUnder / distributionTotal) * 100).toFixed(1)),
      color: "oklch(0.709 0.14 56.259)", // Amber/Orange
    },
    {
      category: "On-Target (±200 MW)",
      count: onTarget,
      percentage: Number(((onTarget / distributionTotal) * 100).toFixed(1)),
      color: "oklch(0.627 0.194 149.214)", // Emerald
    },
    {
      category: "Moderate Over-Forecast (200-1000 MW)",
      count: modOver,
      percentage: Number(((modOver / distributionTotal) * 100).toFixed(1)),
      color: "oklch(0.685 0.169 237.323)", // Cyan/Sky
    },
    {
      category: "Severe Over-Forecast (>1000 MW)",
      count: severeOver,
      percentage: Number(((severeOver / distributionTotal) * 100).toFixed(1)),
      color: "oklch(0.52 0.105 223.128)", // Primary Blue
    },
  ];

  const hourlyProfile = Object.entries(hourlyData).map(([hourStr, data]) => {
    const h = parseInt(hourStr, 10);
    const count = data.count || 1;
    const hAvgAct = data.sumActual / count;
    const hAvgFcast = data.sumForecast / count;
    return {
      hour: `${String(h).padStart(2, "0")}:00`,
      avgActual: Math.round(hAvgAct),
      avgForecast: Math.round(hAvgFcast),
      avgDelta: Math.round(hAvgAct - hAvgFcast),
    };
  });

  const responseRmse = !Array.isArray(input)
    ? input.root_mean_square_error ?? input.root_mean_squared_error
    : undefined;

  const rmse = validPairs.length > 0
    ? Math.sqrt(sumSquaredError / validPairs.length)
    : (responseRmse ?? fallbackRmse ?? 0);

  return {
    totalRecords: points.length,
    validPairs: validPairs.length,
    rmse,
    mae,
    latestActual,
    latestForecast,
    peakActual,
    peakForecast,
    avgActual,
    avgForecast,
    totalActualMWh,
    totalForecastMWh,
    overallVarianceMWh,
    accuracyRate,
    varianceDistribution,
    hourlyProfile,
  };
}

export function useWindData(): UseWindDataState {
  const [data, setData] = useState<WindDataResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [retryAttempt, setRetryAttempt] = useState<number>(0);
  const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null);

  const fetchDataWithRetry = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);
    setError(null);

    let lastErrorMessage = "Unknown network error";

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      setRetryAttempt(attempt);
      if (attempt > 1) {
        setIsRetrying(true);
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        const response = await fetch(API_ENDPOINT, {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(
            `Gateway responded with status ${response.status}: ${response.statusText || "Service Error"}`
          );
        }

        const jsonResult: WindDataResponse = await response.json();

        if (!jsonResult || !Array.isArray(jsonResult.data)) {
          throw new Error("Invalid response format: 'data' array expected from backend.");
        }

        // Normalize RMSE property if needed
        const normalizedResult: WindDataResponse = {
          data: jsonResult.data,
          root_mean_square_error:
            jsonResult.root_mean_square_error ??
            jsonResult.root_mean_squared_error ??
            0,
        };

        setData(normalizedResult);
        setError(null);
        setIsRetrying(false);
        setRetryAttempt(0);
        setLastFetchedAt(new Date());
        setLoading(false);
        return;
      } catch (err: unknown) {
        if (err instanceof Error) {
          lastErrorMessage =
            err.name === "AbortError"
              ? "Request timed out after 12 seconds."
              : err.message;
        } else {
          lastErrorMessage = String(err);
        }

        // If not on the last attempt, wait with exponential backoff before retrying
        if (attempt < MAX_RETRIES) {
          const backoff = INITIAL_BACKOFF_MS * Math.pow(2, attempt - 1);
          await new Promise((resolve) => setTimeout(resolve, backoff));
        }
      }
    }

    // All retries failed - do not mock data, report clear production error
    setIsRetrying(false);
    setLoading(false);
    setData(null);
    setError(
      `Failed to connect to the wind generation telemetry stream at ${API_ENDPOINT} after ${MAX_RETRIES} attempts. Reason: ${lastErrorMessage}`
    );
  }, []);

  // oxlint-disable-next-line react/set-state-in-effect
  useEffect(() => {
    void fetchDataWithRetry();
  }, [fetchDataWithRetry]);

  const analytics = useMemo(() => {
    if (!data) return null;
    return computeAnalytics(data);
  }, [data]);

  return {
    data,
    analytics,
    loading,
    error,
    isRetrying,
    retryAttempt,
    maxRetries: MAX_RETRIES,
    lastFetchedAt,
    refetch: fetchDataWithRetry,
  };
}
