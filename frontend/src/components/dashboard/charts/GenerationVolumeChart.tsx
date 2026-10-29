import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CustomChartTooltip } from "./CustomChartTooltip";
import type { WindDataPoint } from "@/types/wind";
import { formatDateShort } from "@/lib/utils";
import { Lightning } from "@phosphor-icons/react";

interface GenerationVolumeChartProps {
  data: WindDataPoint[];
}

export function GenerationVolumeChart({ data }: GenerationVolumeChartProps) {
  return (
    <Card className="h-full border border-border/80 shadow-xs">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-sky-500/10 text-sky-500">
              <Lightning size={16} weight="bold" />
            </span>
            <CardTitle className="text-base font-semibold tracking-tight">
              Generation Volume & Dispatch Envelope
            </CardTitle>
          </div>
          <CardDescription className="text-xs mt-1">
            Real-time power volume delivered across UK grid transmission nodes
          </CardDescription>
        </div>

        {/* Legend indicators */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="font-medium text-foreground">Dispatched</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-purple-500" />
            <span className="font-medium text-foreground">Scheduled Forecast</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="h-[280px] w-full min-h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 12, left: -4, bottom: 4 }}
            >
              <defs>
                <linearGradient id="actualVolumeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="forecastVolumeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
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
                width={40}
              />
              <Tooltip content={<CustomChartTooltip />} />
              <Area
                type="monotone"
                dataKey="actual_generation"
                name="Dispatched Generation"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#actualVolumeGrad)"
                connectNulls={true}
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="forecast_generation"
                name="Scheduled Forecast"
                stroke="#a855f7"
                strokeWidth={1.75}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#forecastVolumeGrad)"
                connectNulls={true}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
