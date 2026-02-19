import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Transaction, TransactionRequest } from '../models/transaction.interface';
import { Category } from './category';
import { CurrencyFormatPipe } from '../shared/pipes/currency-format-pipe';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  
  private http = inject(HttpClient);
  private readonly apiUrl= `${environment.apiUrl}/transactions`

  private transactionsSubject= new BehaviorSubject<Transaction[]>([]);

  transactions$ = this.transactionsSubject.asObservable();


  getAllTransactions():Observable<Transaction[]>{

    return this.http.get<Transaction[]>
    (
      this.apiUrl
    ).pipe(
      tap((transactions: Transaction[]) =>{

        this.transactionsSubject.next(transactions)
      }
    
    )
    )
  }

  getTransactionById( id: string):Observable<Transaction>{

    return this.http.get<Transaction>(
      `${this.apiUrl}/${id}`
    )
  }

  getTransactionByType(type: 'income' |'expense'):Observable<Transaction[]>{

  return this.http.get<Transaction[]>(
    `${this.apiUrl}/type/${type}`
  )
  }

  getTransactionByCategory(category:string):Observable<Category[]>{
    return this.http.get<Category[]>(
      `${this.apiUrl}/category ${category}`
    )

  }

  createTransaction(data: TransactionRequest):Observable<Transaction>{

    return this.http.post<Transaction>(
      this.apiUrl,data
    ).pipe(

      tap((newTransaction:Transaction)=> {

        const current = this.transactionsSubject.value;
        this.transactionsSubject.next([newTransaction,...current])
      })
    )

  }


  updateTransaction(id:string,data:Partial<TransactionRequest>):Observable<Transaction>{

    return this.http.put<Transaction>(
      `${this.apiUrl}/${id}`,data).pipe(

        tap((updateTransaction:Transaction)=>{

          const current = this.transactionsSubject.value;
          const index = current.findIndex(T =>T.id  === id);
          if(index !== -1){

            const updated = [...current];
            updated[index] = updateTransaction;
            this.transactionsSubject.next(updated);
          }
        })
      )
    
  }

  deleteTransaction(id: string):Observable<any>{

    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const current = this.transactionsSubject.value;
        this.transactionsSubject.next(current.filter(t => t.id !==id));
      }
    )
    )
  }

  getTransactionSummary():Observable<any>{

    return this.http.get<any>(
     `${this.apiUrl}/summary` 
    )
  }
  getTransactionByDateRange(startDate:string,endDate:string):Observable<Transaction[]>{
    return this.http.get<Transaction[]>(
      `${this.apiUrl}/range?start=${startDate}&end={endDate}`
    )

  }

}
