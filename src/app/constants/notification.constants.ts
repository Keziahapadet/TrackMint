import { NotificationType } from '../models/notification.interface';

export const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  [NotificationType.BUDGET_ALERT]: 'warning',
  [NotificationType.BUDGET_WARNING]: 'priority_high',
  [NotificationType.BUDGET_EXCEEDED]: 'error',
  [NotificationType.LARGE_TRANSACTION]: 'payments',
  [NotificationType.WEEKLY_SUMMARY]: 'summarize',
  [NotificationType.MONTHLY_SUMMARY]: 'calendar_month',
  [NotificationType.GOAL_ACHIEVED]: 'celebration',
  [NotificationType.SYSTEM]: 'info'
};

export const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  [NotificationType.BUDGET_ALERT]: '#F59E0B',
  [NotificationType.BUDGET_WARNING]: '#F59E0B',
  [NotificationType.BUDGET_EXCEEDED]: '#EF4444',
  [NotificationType.LARGE_TRANSACTION]: '#3B82F6',
  [NotificationType.WEEKLY_SUMMARY]: '#10B981',
  [NotificationType.MONTHLY_SUMMARY]: '#10B981',
  [NotificationType.GOAL_ACHIEVED]: '#8B5CF6',
  [NotificationType.SYSTEM]: '#6B7280'
};

export const NOTIFICATION_MESSAGES = {
  BUDGET_WARNING: (category: string, percentage: number) => 
    `You've used ${percentage}% of your ${category} budget`,
  BUDGET_EXCEEDED: (category: string, amount: number) => 
    `You've exceeded your ${category} budget by ksh ${amount}`,
  LARGE_TRANSACTION: (description: string, amount: number, type: string) => 
    `Large ${type}: ksh ${amount} - ${description}`,
  WEEKLY_SUMMARY: (spent: number, earned: number, saved: number) => 
    `This week: ksh ${earned} earned, ksh ${spent} spent, ksh ${saved} saved`
};