

export interface Transaction {
  id: string;
  description: string;
  category: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  date: string;
}
export interface TransactionRequest {
  description: string;
  category: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  date?: string;
}
export interface TransactionResponse{

  success:boolean;
  message:string;
  data?:Transaction |Transaction[];
}

