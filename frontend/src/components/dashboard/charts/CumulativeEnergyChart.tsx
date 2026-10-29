import { useMemo } from "react";
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CustomChartTooltip } from "./CustomChartTooltip";
import type { WindDataPoint, ForecastHorizon } from "@/types/wind";
import { formatDateShort, formatNumber } from "@/lib/utils";
import { TrendUp, ArrowUpRight, ArrowDownRight } from "@phosphor-icons/react";

interface CumulativeEnergyChartProps {
  data: WindDataPoint[];
  horizon?: ForecastHorizon;
}

export function CumulativeEnergyChart({
  data,
  horizon = "day-ahead",
}: CumulativeEnergyChartProps) {
  // Compute running cumulative energy in GWh (30 min = 0.5 hour per interval)
  const { chartData, totalActualGWh, totalForecastGWh, netVarianceGWh } = useMemo(() => {
    let runningActualMWh = 0;
    let runningForecastMWh = 0;
    const points = [];

    for (const d of data) {
      const actMWh = d.actual_generation !== null ? d.actual_generation * 0.5 : 0;
      const fcastMWh = d.forecast_generation !== null ? d.forecast_generation * 0.5 : 0;

      runningActualMWh += actMWh;
      runningForecastMWh += fcastMWh;

      const actGWh = runningActualMWh / 1000;
      const fcastGWh = runningForecastMWh / 1000;
      const netGWh = actGWh - fcastGWh;

      points.push({
        start_time: d.start_time,
        cumulativeActualGWh: Number(actGWh.toFixed(2)),
        cumulativeForecastGWh: Number(fcastGWh.toFixed(2)),
        netVarianceGWh: Number(netGWh.toFixed(2)),
      });
    }

    const totActGWh = runningActualMWh / 1000;
    const totFcastGWh = runningForecastMWh / 1000;
    const netGWh = totActGWh - totFcastGWh;

    return {
      chartData: points,
      totalActualGWh: totActGWh,
      totalForecastGWh: totFcastGWh,
      netVarianceGWh: netGWh,
    };
  }, [data]);

  const isNetSurplus = netVarianceGWh >= 0;

  return (
    <Card className="h-full border border-border/80 shadow-xs">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-purple-500/10 text-purple-500">
              <TrendUp size={16} weight="bold" />
            </span>
            <CardTitle className="text-base font-semibold tracking-tight">
              Cumulative Energy & Wholesale Settlement Tracker
            </CardTitle>
          </div>
          <CardDescription className="text-xs mt-1">
            Delivered volume ({totalActualGWh > 0 ? `${formatNumber(totalActualGWh, 1)} GWh` : "0 GWh"}) vs. {horizon === "intraday" ? "Intraday" : "Day-Ahead"} target ({totalForecastGWh > 0 ? `${formatNumber(totalForecastGWh, 1)} GWh` : "0 GWh"})
          </CardDescription>
        </div>

        {/* Live Net Position Badge & Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="font-medium text-foreground">Actual (Delivered)</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-purple-500" />
            <span className="font-medium text-foreground">
              {horizon === "intraday" ? "Intraday" : "Day-Ahead"} Target
            </span>
          </div>
          <div
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm font-mono text-[11px] font-semibold border ${
              isNetSurplus
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
            }`}
            title="Cumulative imbalance volume at end of period"
          >
            {isNetSurplus ? <ArrowUpRight size={13} weight="bold" /> : <ArrowDownRight size={13} />}
            <span>
              {isNetSurplus ? "+" : ""}
              {formatNumber(netVarianceGWh, 1)} GWh {isNetSurplus ? "(Surplus)" : "(Deficit)"}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="h-[280px] w-full min-h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 12, left: 8, bottom: 4 }}
            >
              <defs>
                <linearGradient id="cumActualGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="currentColor"
                className="stroke-border/40"
              />
              <XAxis
                dataKey="start_time"
                stroke="currentColor"
                className="text-[10px] text-muted-foreground"
                tickLine={false}
                axisLine={{ stroke: "var(--color-border)", opacity: 0.5 }}
                tickFormatter={(time: string) => formatDateShort(time)}
                minTickGap={40}
              />
              <YAxis
                stroke="currentColor"
                className="text-[10px] font-mono text-muted-foreground"
                tickLine={false}
                axisLine={false}
                tickFormatter={(val: number) =>
                  val === 0
                    ? "0\u00A0GWh"
                    : `${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}k\u00A0GWh`
                }
                width={54}
              />
              <Tooltip
                content={
                  <CustomChartTooltip
                    valueFormatter={(val, name) => {
                      if (val === null || val === undefined) return "—";
                      const num = Number(val);
                      if (name === "Net Imbalance") {
                        const sign = num >= 0 ? "+" : "";
                        return `${sign}${formatNumber(num, 2)} GWh`;
                      }
                      return `${formatNumber(num, 2)} GWh`;
                    }}
                  />
                }
              />
              {/* Cumulative Delivered Energy Area */}
              <Area
                type="monotone"
                dataKey="cumulativeActualGWh"
                name="Cumulative Delivered"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#cumActualGrad)"
                isAnimationActive={false}
              />
              {/* Cumulative Contracted Forecast Line */}
              <Line
                type="monotone"
                dataKey="cumulativeForecastGWh"
                name={
                  horizon === "intraday"
                    ? "Cumulative Intraday Target"
                    : "Cumulative Day-Ahead Contract"
                }
                stroke="#a855f7"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
