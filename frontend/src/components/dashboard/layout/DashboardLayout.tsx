import type { ReactNode } from "react";
import { Header } from "./Header";

interface DashboardLayoutProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  isRefreshing?: boolean;
  lastSync?: Date | null;
  error?: string | null;
}

export function DashboardLayout({
  children,
  onRefresh,
  isRefreshing,
  lastSync,
  error,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20">
      <div className="flex min-h-screen flex-col w-full">
        {/* Sticky Top Header */}
        <Header
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
          lastSync={lastSync}
          error={error}
        />

        {/* Dashboard Main Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1920px] w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
