import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CustomChartTooltip } from "./CustomChartTooltip";

interface HourlyProfilePoint {
  hour: string;
  avgActual: number;
  avgForecast: number;
  avgDelta: number;
}

interface CapacityBarChartProps {
  data: HourlyProfilePoint[];
}

export function CapacityBarChart({ data }: CapacityBarChartProps) {
  return (
    <Card className="h-full border border-border/80 shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/40">
        <div>
          <CardTitle className="text-base font-semibold tracking-tight">
            Diurnal Hourly Load Profile
          </CardTitle>
          <CardDescription className="text-xs mt-1">
            24-hour settlement profile comparing average actual vs. forecast yield (UTC)
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="h-[280px] w-full min-h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 12, left: -4, bottom: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="currentColor"
                className="stroke-border/40"
              />
              <XAxis
                dataKey="hour"
                stroke="currentColor"
                className="text-[11px] text-muted-foreground"
                tickLine={false}
                axisLine={{ stroke: "var(--color-border)", opacity: 0.5 }}
                interval={2}
              />
              <YAxis
                stroke="currentColor"
                className="text-[11px] font-mono text-muted-foreground"
                tickLine={false}
                axisLine={false}
                tickFormatter={(val: number) => `${Math.round(val / 1000)}k`}
                width={40}
              />
              <Tooltip
                content={
                  <CustomChartTooltip
                    titleFormatter={(label) => `Settlement Hour: ${String(label)} UTC`}
                  />
                }
              />
              <Legend
                verticalAlign="bottom"
                height={32}
                iconType="circle"
                wrapperStyle={{
                  paddingTop: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar
                dataKey="avgActual"
                name="Avg Actual MW"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                maxBarSize={20}
                isAnimationActive={false}
              />
              <Bar
                dataKey="avgForecast"
                name="Avg Forecast MW"
                fill="#f43f5e"
                radius={[4, 4, 0, 0]}
                maxBarSize={20}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
