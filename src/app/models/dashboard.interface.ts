export interface DashboardSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  recentTransactions: DashboardTransaction[];
  categorySpending: { [key: string]: number };
  weeklySpending: { [key: string]: number };
}

export interface DashboardTransaction {
  id: string;
  description: string;
  category: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  date: string;
}

export interface CategorySpending {
  name: string;
  amount: number;
  color: string;
  percentage: number;
}

export interface WeeklyData {
  labels: string[];
  values: number[];
}