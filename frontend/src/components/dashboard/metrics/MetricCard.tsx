import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendUp, TrendDown, Minus } from "@phosphor-icons/react";

export interface MetricCardProps {
  title: string;
  value: string;
  unit?: string;
  valueLabel?: string;
  description?: string;
  badgeText?: string;
  badgeTitle?: string;
  trend?: "up" | "down" | "neutral";
  sentiment?: "positive" | "negative" | "neutral";
  secondaryMetric?: {
    label: string;
    value: string;
  };
}

export function MetricCard({
  title,
  value,
  unit,
  valueLabel,
  description,
  badgeText,
  badgeTitle,
  trend,
  sentiment = "neutral",
  secondaryMetric,
}: MetricCardProps) {
  const getBadgeVariant = () => {
    if (sentiment === "positive") return "success";
    if (sentiment === "negative") return "destructive";
    return "secondary";
  };

  return (
    <Card className="relative overflow-hidden border border-border/80 shadow-xs hover:border-primary/40 hover:shadow-sm transition-all duration-200">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                {title}
              </span>
              {valueLabel && (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-muted/90 text-muted-foreground border border-border/50 font-medium uppercase tracking-tight">
                  {valueLabel}
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-1.5 pt-0.5">
              <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-foreground tabular-nums">
                {value}
              </span>
              {unit && (
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                  {unit}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2.5 text-xs">
          {badgeText && (
            <Badge
              variant={getBadgeVariant()}
              title={badgeTitle}
              className="p-1 text-[10px] font-mono font-medium inline-flex items-center justify-center gap-1 leading-none cursor-default"
            >
              {trend === "up" && <TrendUp size={10} weight="bold" className="shrink-0" />}
              {trend === "down" && <TrendDown size={10} weight="bold" className="shrink-0" />}
              {trend === "neutral" && <Minus size={10} weight="bold" className="shrink-0" />}
              <span className="leading-none pt-px">{badgeText}</span>
            </Badge>
          )}

          {description && !secondaryMetric && (
            <span className="text-muted-foreground text-[11px] truncate">{description}</span>
          )}

          {secondaryMetric && (
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span>{secondaryMetric.label}:</span>
              <span className="font-mono font-semibold text-foreground">
                {secondaryMetric.value}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
