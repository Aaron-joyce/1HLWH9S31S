import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Wind,
  ChartLineUp,
  SlidersHorizontal,
  ClockCounterClockwise,
  ShieldCheck,
  FileText,
  CaretLeft,
  CaretRight,
  Lightning,
  Sparkle,
} from "@phosphor-icons/react";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  activeNavId?: string;
  onSelectNav?: (id: string) => void;
}

interface NavItemDef {
  id: string;
  label: string;
  icon: ReactNode;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "success" | "warning";
}

export function Sidebar({
  collapsed,
  onToggleCollapsed,
  mobileOpen,
  onCloseMobile,
  activeNavId = "telemetry",
  onSelectNav,
}: SidebarProps) {
  const mainNavItems: NavItemDef[] = [
    {
      id: "telemetry",
      label: "Real-Time Telemetry",
      icon: <ChartLineUp size={18} weight="duotone" />,
      badge: "Live",
      badgeVariant: "success",
    },
    {
      id: "wind-farms",
      label: "Offshore & Onshore",
      icon: <Wind size={18} weight="duotone" />,
    },
    {
      id: "dispatch",
      label: "Dispatch Schedules",
      icon: <Lightning size={18} weight="duotone" />,
      badge: "BMRS",
      badgeVariant: "secondary",
    },
    {
      id: "history",
      label: "Settlement Archive",
      icon: <ClockCounterClockwise size={18} weight="duotone" />,
    },
    {
      id: "compliance",
      label: "Grid Compliance",
      icon: <ShieldCheck size={18} weight="duotone" />,
    },
    {
      id: "reports",
      label: "Financial Outturn",
      icon: <FileText size={18} weight="duotone" />,
    },
    {
      id: "config",
      label: "Model Calibration",
      icon: <SlidersHorizontal size={18} weight="duotone" />,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Close mobile navigation"
          onClick={onCloseMobile}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              onCloseMobile();
            }
          }}
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Main Sidebar Aside */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-border/80 bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${collapsed ? "w-16" : "w-64"}`}
      >
        {/* Brand / Logo Header */}
        <div className="flex h-14 items-center justify-between px-3.5 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
              <Wind size={18} weight="bold" />
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="font-heading text-sm font-bold tracking-tight text-sidebar-foreground">
                  AERO<span className="text-primary">GRID</span>
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
                  BMRS Analytics
                </span>
              </div>
            )}
          </div>

          {/* Desktop Toggle Button */}
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? "Expand sidebar (Ctrl+B)" : "Collapse sidebar (Ctrl+B)"}
            title={collapsed ? "Expand sidebar (Ctrl+B)" : "Collapse sidebar (Ctrl+B)"}
            className="hidden lg:flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            {collapsed ? <CaretRight size={14} /> : <CaretLeft size={14} />}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-1">
          {!collapsed && (
            <div className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Core Operations
            </div>
          )}

          {mainNavItems.map((item) => {
            const isActive = activeNavId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectNav?.(item.id);
                  onCloseMobile();
                }}
                title={collapsed ? item.label : undefined}
                className={`group relative flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}
              >
                {/* Active Indicator Rail */}
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-primary" />
                )}

                <span
                  className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {item.icon}
                </span>

                {!collapsed && (
                  <span className="flex-1 truncate text-left">{item.label}</span>
                )}

                {!collapsed && item.badge && (
                  <Badge
                    variant={item.badgeVariant || "secondary"}
                    className="text-[10px] py-0 px-1.5 h-4 font-mono font-normal"
                  >
                    {item.badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer: Live Telemetry Indicator & Shortcut hint */}
        <div className="p-3 border-t border-sidebar-border bg-sidebar-accent/30 space-y-2">
          {!collapsed ? (
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-[11px] font-medium text-foreground">
                  Elexon BMRS Stream
                </span>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">
                30m Sync
              </span>
            </div>
          ) : (
            <div className="flex justify-center" title="BMRS Stream Active">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            </div>
          )}

          {!collapsed && (
            <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
              <span className="flex items-center gap-1">
                <Sparkle size={11} className="text-primary" />
                <span>UK National Grid ESO</span>
              </span>
              <kbd className="rounded bg-muted px-1 py-0.5 text-[9px] border border-border">
                Ctrl+B
              </kbd>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
