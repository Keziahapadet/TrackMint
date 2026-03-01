export interface Budget {
  id: string;
  category: string;
  icon: string;
  amount: number;
  spent: number;
  color: string;
  period?: 'monthly' | 'weekly' | 'yearly';
  month?: number;
  year?: number;
}

export interface BudgetRequest {
  category: string;
  amount: number;
  spent?: number;
  period?: 'monthly' | 'weekly' | 'yearly';
  month?: number;
  year?: number;
}

export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  overBudget: number;
  budgetCount: number;
}

export interface BudgetProgress {
  category: string;
  percentage: number;
  status: 'on-track' | 'warning' | 'exceeded';
  remaining: number;
}