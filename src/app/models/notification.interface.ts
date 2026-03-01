export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  link?: string;
  timeAgo?: string;
  icon?: string;
  color?: string;
  
 
  category?: string;
  percentage?: number;
  amount?: number;
  spent?: number;
  remaining?: number;
}

export interface NotificationRequest {
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
}

export interface NotificationSummary {
  unreadCount: number;
  recentNotifications: Notification[];
  unreadNotifications: Notification[];
}

export enum NotificationType {
  BUDGET_ALERT = 'BUDGET_ALERT',
  BUDGET_WARNING = 'BUDGET_WARNING',
  BUDGET_EXCEEDED = 'BUDGET_EXCEEDED',
  LARGE_TRANSACTION = 'LARGE_TRANSACTION',
  WEEKLY_SUMMARY = 'WEEKLY_SUMMARY',
  MONTHLY_SUMMARY = 'MONTHLY_SUMMARY',
  GOAL_ACHIEVED = 'GOAL_ACHIEVED',
  SYSTEM = 'SYSTEM'
}