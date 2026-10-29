import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CustomChartTooltip } from "./CustomChartTooltip";
import type { WindDataPoint, ForecastHorizon } from "@/types/wind";
import type { ChartSeriesToggle } from "@/types/analytics";
import { formatDateShort } from "@/lib/utils";
import { ChartLineUp, Eye, EyeSlash } from "@phosphor-icons/react";

interface WindForecastChartProps {
  data: WindDataPoint[];
  rmse: number;
  benchmarkRmse?: number;
  seriesToggle: ChartSeriesToggle;
  onToggleSeries: (seriesKey: keyof ChartSeriesToggle) => void;
  horizon?: ForecastHorizon;
}

export function WindForecastChart({
  data,
  rmse,
  benchmarkRmse,
  seriesToggle,
  onToggleSeries,
  horizon = "day-ahead",
}: WindForecastChartProps) {
  // Transform data for chart: add computed delta when both exist
  const chartData = useMemo(() => {
    return data.map((d) => {
      const act = d.actual_generation;
      const fcast = d.forecast_generation;
      const delta = act !== null && fcast !== null ? act - fcast : null;
      return {
        ...d,
        variance: delta,
      };
    });
  }, [data]);

  return (
    <Card className="h-full border border-border/80 shadow-xs">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
              <ChartLineUp size={16} weight="bold" />
            </span>
            <CardTitle className="text-base font-semibold tracking-tight">
              Actual vs. {horizon === "intraday" ? "Intraday" : "Day-Ahead"} Forecast Trend
            </CardTitle>
          </div>
          <CardDescription className="text-xs mt-1">
            Continuous 30-minute settlement period telemetry (BMRS WINDFOR {horizon === "intraday" ? "Pre-Gate" : "D-1 Wholesale"} vs. FUELHH)
          </CardDescription>
        </div>

        {/* Series Visibility Toggles */}
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => onToggleSeries("showActual")}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
              seriesToggle.showActual
                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
                : "bg-muted/40 text-muted-foreground border-transparent opacity-60"
            }`}
          >
            {seriesToggle.showActual ? <Eye size={13} weight="bold" /> : <EyeSlash size={13} />}
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span>Actual</span>
          </button>

          <button
            type="button"
            onClick={() => onToggleSeries("showForecast")}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
              seriesToggle.showForecast
                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                : "bg-muted/40 text-muted-foreground border-transparent opacity-60"
            }`}
          >
            {seriesToggle.showForecast ? <Eye size={13} weight="bold" /> : <EyeSlash size={13} />}
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            <span>{horizon === "intraday" ? "Intraday" : "Day-Ahead"}</span>
          </button>

          <button
            type="button"
            onClick={() => onToggleSeries("showVariance")}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
              seriesToggle.showVariance
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                : "bg-muted/40 text-muted-foreground border-transparent opacity-60"
            }`}
          >
            {seriesToggle.showVariance ? <Eye size={13} weight="bold" /> : <EyeSlash size={13} />}
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Variance (Δ)</span>
          </button>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3 px-1">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="font-semibold text-foreground">Window points:</span> {data.length}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="font-semibold text-foreground">Window RMSE:</span>{" "}
              <span className="font-mono text-primary font-bold">{rmse.toFixed(2)} MW</span>
              {benchmarkRmse !== undefined && Math.abs(benchmarkRmse - rmse) > 0.01 && (
                <span className="text-[11px] text-muted-foreground font-mono">
                  (Month: {benchmarkRmse.toFixed(2)} MW)
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="h-[360px] w-full min-h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 12, right: 16, left: 0, bottom: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="currentColor"
                className="stroke-border/40"
              />
              <XAxis
                dataKey="start_time"
                stroke="currentColor"
                className="text-[11px] text-muted-foreground"
                tickLine={false}
                axisLine={{ stroke: "var(--color-border)", opacity: 0.5 }}
                tickFormatter={(time: string) => formatDateShort(time)}
                minTickGap={40}
              />
              <YAxis
                stroke="currentColor"
                className="text-[11px] font-mono text-muted-foreground"
                tickLine={false}
                axisLine={false}
                tickFormatter={(val: number) => `${Math.round(val / 1000)}k`}
                width={44}
              />
              <Tooltip content={<CustomChartTooltip />} filterNull={false} />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{
                  paddingTop: "12px",
                  fontSize: "12px",
                }}
              />

              {seriesToggle.showActual && (
                <Line
                  type="monotone"
                  dataKey="actual_generation"
                  name="Actual Generation"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  connectNulls={true}
                  activeDot={{ r: 5, fill: "#3b82f6", strokeWidth: 0 }}
                  isAnimationActive={false}
                />
              )}

              {seriesToggle.showForecast && (
                <Line
                  type="monotone"
                  dataKey="forecast_generation"
                  name={horizon === "intraday" ? "Intraday Forecast" : "Day-Ahead Forecast"}
                  stroke="#f43f5e"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                  connectNulls={true}
                  activeDot={{ r: 5, fill: "#f43f5e", strokeWidth: 0 }}
                  isAnimationActive={false}
                />
              )}

              {seriesToggle.showVariance && (
                <Line
                  type="monotone"
                  dataKey="variance"
                  name="Delta (Actual - Forecast)"
                  stroke="#10b981"
                  strokeWidth={1.5}
                  dot={false}
                  connectNulls={true}
                  activeDot={{ r: 4, fill: "#10b981", strokeWidth: 0 }}
                  isAnimationActive={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
