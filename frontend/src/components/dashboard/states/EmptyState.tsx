import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, ArrowsClockwise } from "@phosphor-icons/react";

interface EmptyStateProps {
  onRefresh?: () => void;
  title?: string;
  description?: string;
}

export function EmptyState({
  onRefresh,
  title = "No Telemetry Data Available",
  description = "No generation settlement records were returned for the selected filter window.",
}: EmptyStateProps) {
  return (
    <Card className="flex min-h-[360px] w-full items-center justify-center border-dashed border-2 border-border/80">
      <CardContent className="p-8 text-center max-w-md space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <Database size={24} weight="duotone" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
        </div>
        {onRefresh && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="gap-1.5"
          >
            <ArrowsClockwise size={14} />
            <span>Refresh Window</span>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
