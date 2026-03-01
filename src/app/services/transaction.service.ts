import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { Transaction, TransactionRequest } from '../models/transaction.interface';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/transactions`;

  private transactionsSubject = new BehaviorSubject<Transaction[]>([]);
  transactions$ = this.transactionsSubject.asObservable();

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.warn('No token found in localStorage');
      return new HttpHeaders({
        'Content-Type': 'application/json'
      });
    }
    
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
      console.error('Client error:', error.error.message);
    } else {
      // Server-side error
      errorMessage = `Server Error: ${error.status} - ${error.message}`;
      console.error(`Backend returned code ${error.status}, body was:`, error.error);
      
      // Handle specific status codes
      switch (error.status) {
        case 401:
          errorMessage = 'Unauthorized. Please login again.';
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          break;
        case 403:
          errorMessage = 'Access forbidden. You don\'t have permission.';
          break;
        case 404:
          errorMessage = 'Resource not found.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }

  getAllTransactions(): Observable<Transaction[]> {
    console.log('Fetching all transactions from:', this.apiUrl);
    
    return this.http.get<Transaction[]>(this.apiUrl, { 
      headers: this.getHeaders() 
    }).pipe(
      tap((transactions: Transaction[]) => {
        console.log('Transactions loaded successfully:', transactions);
        this.transactionsSubject.next(transactions);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  getTransactionById(id: string): Observable<Transaction> {
    console.log(`Fetching transaction with ID: ${id}`);
    
    return this.http.get<Transaction>(`${this.apiUrl}/${id}`, { 
      headers: this.getHeaders() 
    }).pipe(
      tap((transaction: Transaction) => {
        console.log('Transaction loaded:', transaction);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  getTransactionByType(type: 'income' | 'expense'): Observable<Transaction[]> {
    const apiType = type === 'income' ? 'INCOME' : 'EXPENSE';
    console.log(`Fetching transactions of type: ${apiType}`);
    
    return this.http.get<Transaction[]>(`${this.apiUrl}/type/${apiType}`, { 
      headers: this.getHeaders() 
    }).pipe(
      tap((transactions: Transaction[]) => {
        console.log(`${type} transactions loaded:`, transactions);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  getTransactionByCategory(category: string): Observable<Transaction[]> {
    console.log(`Fetching transactions for category: ${category}`);
    
    return this.http.get<Transaction[]>(`${this.apiUrl}/category/${category}`, { 
      headers: this.getHeaders() 
    }).pipe(
      tap((transactions: Transaction[]) => {
        console.log(`Transactions for category ${category}:`, transactions);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  createTransaction(data: TransactionRequest): Observable<Transaction> {
    console.log('Creating new transaction at:', this.apiUrl);
    console.log('Transaction data:', data);
    
    return this.http.post<Transaction>(this.apiUrl, data, { 
      headers: this.getHeaders() 
    }).pipe(
      tap((newTransaction: Transaction) => {
        console.log('Transaction created successfully:', newTransaction);
        
        // Update the BehaviorSubject with the new transaction
        const currentTransactions = this.transactionsSubject.value;
        this.transactionsSubject.next([newTransaction, ...currentTransactions]);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  updateTransaction(id: string, data: Partial<TransactionRequest>): Observable<Transaction> {
    console.log(`Updating transaction ${id} at:`, `${this.apiUrl}/${id}`);
    console.log('Update data:', data);
    
    return this.http.put<Transaction>(`${this.apiUrl}/${id}`, data, { 
      headers: this.getHeaders() 
    }).pipe(
      tap((updatedTransaction: Transaction) => {
        console.log('Transaction updated successfully:', updatedTransaction);
        
        // Update the BehaviorSubject with the updated transaction
        const currentTransactions = this.transactionsSubject.value;
        const index = currentTransactions.findIndex(t => t.id === id);
        
        if (index !== -1) {
          const updatedTransactions = [...currentTransactions];
          updatedTransactions[index] = updatedTransaction;
          this.transactionsSubject.next(updatedTransactions);
        }
      }),
      catchError(this.handleError.bind(this))
    );
  }

  deleteTransaction(id: string): Observable<any> {
    console.log(`Deleting transaction ${id} at:`, `${this.apiUrl}/${id}`);
    
    return this.http.delete(`${this.apiUrl}/${id}`, { 
      headers: this.getHeaders(),
      responseType: 'text' as 'json'  // Handle non-JSON response (204 No Content)
    }).pipe(
      tap(() => {
        console.log('Transaction deleted successfully:', id);
        
        // Update the BehaviorSubject by removing the deleted transaction
        const currentTransactions = this.transactionsSubject.value;
        this.transactionsSubject.next(currentTransactions.filter(t => t.id !== id));
      }),
      catchError(this.handleError.bind(this))
    );
  }

  getTransactionSummary(): Observable<any> {
    console.log('Fetching transaction summary from:', `${this.apiUrl}/summary`);
    
    return this.http.get<any>(`${this.apiUrl}/summary`, { 
      headers: this.getHeaders() 
    }).pipe(
      tap((summary: any) => {
        console.log('Transaction summary loaded:', summary);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  getTransactionByDateRange(startDate: string, endDate: string): Observable<Transaction[]> {
    console.log(`Fetching transactions from ${startDate} to ${endDate}`);
    
    return this.http.get<Transaction[]>(
      `${this.apiUrl}/range?start=${startDate}&end=${endDate}`, 
      { headers: this.getHeaders() }
    ).pipe(
      tap((transactions: Transaction[]) => {
        console.log(`Transactions in date range:`, transactions);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  // Helper method to refresh transactions (useful after certain operations)
  refreshTransactions(): void {
    this.getAllTransactions().subscribe();
  }

  // Helper method to clear the local cache
  clearCache(): void {
    this.transactionsSubject.next([]);
  }

  // Helper method to get current transactions without making an API call
  getCurrentTransactions(): Transaction[] {
    return this.transactionsSubject.value;
  }

  // Helper method to check if user is authenticated
  private isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
}