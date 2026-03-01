export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  totalSpent?: number;
  transactionCount?: number;
  budget?: number;
}

export interface CategoryRequest {
  name: string;
  icon: string;
  color: string;
}

export interface CategorySummary {
  totalCategories: number;
  totalSpent: number;
  topCategory: string;
  averagePerCategory: number;
}