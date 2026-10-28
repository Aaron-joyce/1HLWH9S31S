import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TornadoIcon,
  Bell,
  ArrowsClockwise,
  CheckCircle,
  WarningCircle,
  CircleNotch,
} from "@phosphor-icons/react";

interface HeaderProps {
  onRefresh: () => Promise<void>;
  isRefreshing?: boolean;
  lastSync?: Date | null;
  error?: string | null;
}

export function Header({
  onRefresh,
  isRefreshing,
  lastSync,
  error,
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-border/80 bg-background/90 px-4 sm:px-6 backdrop-blur-md">
      {/* Left: AeroGrid Brand */}
      <div className="flex items-center gap-2.5">
        <div className="flex p-2 shrink-0 items-center justify-center rounded-sm bg-primary text-primary-foreground shadow-xs">
          <TornadoIcon size={22} weight="bold" />
        </div>
        <span className="font-heading text-md font-extrabold tracking-tight text-foreground">
          AERO<span className="text-primary">GRID</span>
        </span>
      </div>

      {/* Right Controls: Sync status, Refresh, Notifications, National Grid ESO Label */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Status Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono border border-border/60 bg-muted/20">
          {error ? (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
              <span className="text-destructive font-semibold">Feed Offline</span>
            </>
          ) : (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-muted-foreground">
                {lastSync ? `Synced ${lastSync.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}` : "BMRS Stream"}
              </span>
            </>
          )}
        </div>

        {/* Refresh Action */}
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => void onRefresh()}
          disabled={isRefreshing}
          title="Refresh Data from Ingestion Gateway"
          className="text-muted-foreground hover:text-foreground"
        >
          {isRefreshing ? (
            <CircleNotch size={14} className="animate-spin text-primary" />
          ) : (
            <ArrowsClockwise size={14} />
          )}
        </Button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative text-muted-foreground hover:text-foreground"
          >
            <Bell size={14} />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
          </Button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-border/80 bg-popover p-3 text-popover-foreground shadow-xl z-50 animate-in fade-in-0 zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-border/50 text-xs font-semibold">
                <span>System Notifications</span>
                <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                  2 New
                </Badge>
              </div>

              <div className="divide-y divide-border/30 text-xs max-h-64 overflow-y-auto">
                <div className="py-2.5 flex items-start gap-2.5">
                  <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-medium text-foreground">
                      BMRS WINDFOR Stream Initialized
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Day-ahead settlement feed connected to Elexon API.
                    </p>
                  </div>
                </div>

                <div className="py-2.5 flex items-start gap-2.5">
                  <WarningCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-medium text-foreground">
                      Settlement Period 38 Deviation
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Actual output exceeded forecast by 1,240 MW.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* National Grid ESO Static Label */}
        <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/20 px-2.5 py-1 select-none">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground font-mono text-[10px] font-bold shrink-0">
            UK
          </div>
          <span className="text-xs font-medium text-foreground whitespace-nowrap">
            National Grid ESO
          </span>
        </div>
      </div>
    </header>
  );
}
