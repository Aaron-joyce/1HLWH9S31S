import type { ReactNode } from "react";

export interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
  badge?: string | number;
  badgeVariant?: "default" | "secondary" | "outline" | "destructive";
  active?: boolean;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  initials: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  timestamp: string;
  read: boolean;
  type: "info" | "warning" | "alert";
  message: string;
}
