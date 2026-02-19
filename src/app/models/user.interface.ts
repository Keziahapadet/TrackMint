

export interface User {
  id: string;
  email: string;
  fullName: string;  
  currency: string;
  createdAt: Date;
  preferences: UserPreferences;
}

export interface UserPreferences {
  emailNotifications: boolean;
  budgetAlerts: boolean;
  darkMode: boolean;
  language?: string;
}

export interface SavingsGoal {
  id: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: Date;
  description?: string;
}