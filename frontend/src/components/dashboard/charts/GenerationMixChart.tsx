import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ChartPieSlice } from "@phosphor-icons/react";

interface VarianceDistributionItem {
  category: string;
  count: number;
  percentage: number;
  color: string;
}

interface GenerationMixChartProps {
  distribution: VarianceDistributionItem[];
  accuracyRate: number;
}

interface PieTooltipProps {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
    payload?: VarianceDistributionItem;
  }>;
  onActiveChange?: (active: boolean) => void;
}

function PieChartTooltip({ active, payload, onActiveChange }: PieTooltipProps) {
  useEffect(() => {
    onActiveChange?.(Boolean(active && payload && payload.length > 0));
  }, [active, payload, onActiveChange]);

  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className="z-50 rounded-md border border-border/80 bg-card/98 px-3 py-2 text-xs shadow-xl backdrop-blur-md">
      <div className="flex items-center gap-2 mb-1.5">
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: data.color }}
        />
        <span className="font-semibold text-foreground text-xs">{data.category}</span>
      </div>
      <div className="flex items-center justify-between gap-4 font-mono text-[11px] text-muted-foreground pt-1 border-t border-border/40">
        <span>{data.count} intervals</span>
        <span className="font-bold text-foreground">{data.percentage}%</span>
      </div>
    </div>
  );
}

export function GenerationMixChart({
  distribution,
  accuracyRate,
}: GenerationMixChartProps) {
  const activeData = distribution.filter((item) => item.count > 0);
  const [isTooltipActive, setIsTooltipActive] = useState(false);

  return (
    <Card className="h-full border border-border/80 shadow-xs flex flex-col justify-between">
      <CardHeader className="pb-2 border-b border-border/40">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-500">
            <ChartPieSlice size={16} weight="bold" />
          </span>
          <CardTitle className="text-base font-semibold tracking-tight">
            Forecast Error Distribution
          </CardTitle>
        </div>
        <CardDescription className="text-xs mt-1">
          Settlement interval dispersion categorized by MW deviation threshold
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2 pb-4 flex-1 flex flex-col justify-between">
        <div className="relative h-52 w-full min-h-52">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={activeData}
                dataKey="count"
                nameKey="category"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                stroke="var(--color-card)"
                strokeWidth={2}
                isAnimationActive={false}
                onMouseEnter={() => setIsTooltipActive(true)}
                onMouseLeave={() => setIsTooltipActive(false)}
              >
                {activeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                wrapperStyle={{ zIndex: 50, pointerEvents: "none" }}
                content={<PieChartTooltip onActiveChange={setIsTooltipActive} />}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Overlay Metric: gracefully fades out when hovering a slice so tooltip never overlaps */}
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-200 z-0 ${
              isTooltipActive ? "opacity-0" : "opacity-100"
            }`}
          >
            <span className="text-2xl font-bold font-mono tracking-tight text-foreground">
              {accuracyRate.toFixed(1)}%
            </span>
            <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
              Accuracy
            </span>
          </div>
        </div>

        {/* Custom Compact Category Legend */}
        <div className="grid grid-cols-1 gap-1.5 mt-2 pt-2 border-t border-border/40 text-xs">
          {distribution.map((item, idx) => (
            <div
              key={`dist-legend-${idx}`}
              className="flex items-center justify-between gap-2 py-0.5"
            >
              <div className="flex items-center gap-2 truncate text-muted-foreground">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate text-[11px]">{item.category}</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px] shrink-0">
                <span className="text-muted-foreground">{item.count}</span>
                <span className="font-semibold text-foreground w-10 text-right">
                  {item.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
