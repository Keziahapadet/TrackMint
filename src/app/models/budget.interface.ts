

export interface Budget {
  id: string;
  categoryId: string;
  categoryName: string;
  amount: number;
  spent: number;
  month: number; 
  year: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetStatus {
  budget: Budget;
  percentage: number;
  remaining: number;
  isOverBudget: boolean;
}