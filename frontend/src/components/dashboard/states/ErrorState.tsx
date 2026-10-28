import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  WarningCircle,
  ArrowsClockwise,
  Terminal,
  CircleNotch,
  CheckCircle,
} from "@phosphor-icons/react";

interface ErrorStateProps {
  error: string;
  onRetry: () => Promise<void>;
  isRetrying?: boolean;
}

export function ErrorState({ error, onRetry, isRetrying }: ErrorStateProps) {
  const [retryingLocal, setRetryingLocal] = useState<boolean>(false);

  const handleRetry = async () => {
    setRetryingLocal(true);
    try {
      await onRetry();
    } finally {
      setRetryingLocal(false);
    }
  };

  const isBusy = isRetrying || retryingLocal;

  return (
    <div className="flex min-h-[500px] w-full items-center justify-center p-4">
      <Card className="max-w-2xl w-full border border-destructive/30 shadow-lg bg-card/95 backdrop-blur-sm overflow-hidden">
        <div className="h-1.5 w-full bg-destructive" />

        <CardContent className="p-6 sm:p-8 space-y-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive border border-destructive/20">
              <WarningCircle size={28} weight="duotone" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-foreground tracking-tight">
                  Telemetry Ingestion Gateway Unavailable
                </h3>
                <Badge variant="destructive" className="text-[10px] uppercase font-mono">
                  Connection Failed
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The dashboard cannot establish a direct HTTP connection to the Elexon
                settlement feed. Per production system policy, synthetic/mock data
                is strictly prohibited.
              </p>
            </div>
          </div>

          {/* Diagnostic Error Details Box */}
          <div className="rounded-lg border border-border/80 bg-muted/40 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
              <span>DIAGNOSTIC ERROR LOG</span>
              <span>HTTP 500 / Connection Refused</span>
            </div>
            <p className="font-mono text-xs text-destructive/90 break-all bg-background/60 p-2.5 rounded border border-border/40">
              {error}
            </p>
          </div>

          {/* Remediation Checklist */}
          <div className="rounded-lg border border-border/50 bg-background/50 p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <Terminal size={15} />
              <span>Backend Service Diagnostic Checklist:</span>
            </div>
            <ul className="text-xs text-muted-foreground space-y-1.5 pl-6 list-disc">
              <li>
                Verify FastAPI backend server is running on <code className="text-foreground font-mono bg-muted px-1 py-0.5 rounded">http://localhost:8080</code>
              </li>
              <li>
                Run: <code className="text-foreground font-mono bg-muted px-1 py-0.5 rounded">PYTHONPATH=app uvicorn main:app --port 8080</code> inside the <code className="text-foreground font-mono">backend/</code> folder
              </li>
              <li>
                Ensure outbound network access to <code className="text-foreground font-mono bg-muted px-1 py-0.5 rounded">data.elexon.co.uk</code> is active
              </li>
            </ul>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-border/40">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <CheckCircle size={14} className="text-emerald-500" />
              Retries will execute exponential backoff up to 3 times
            </span>

            <Button
              type="button"
              onClick={handleRetry}
              disabled={isBusy}
              className="w-full sm:w-auto gap-2"
              variant="default"
            >
              {isBusy ? (
                <>
                  <CircleNotch size={16} className="animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <ArrowsClockwise size={16} weight="bold" />
                  <span>Retry Connection</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
