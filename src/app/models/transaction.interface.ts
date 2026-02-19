

export interface Transaction {
  id: string;
  description: string;
  category:string;
  categoryIcon:string;
  type:'income' | 'expense';
  amount: number;
  date: string;
  color:string;
  note?:string;
}

export interface TransactionRequest{
description:string;
category:string;
type:'income' | 'expense';
amount:number;
 date: string;
  note?:string;

}
export interface TransactionResponse{

  success:boolean;
  message:string;
  data?:Transaction |Transaction[];
}

