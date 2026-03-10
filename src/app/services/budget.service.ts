import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { BehaviorSubject, Observable, tap, catchError, throwError, shareReplay } from 'rxjs';
import { Budget, BudgetProgress, BudgetRequest, BudgetSummary } from '../models/budget.interface';
import { environment } from '../../environment/environment';
import { DashboardSummary } from '../models/dashboard.interface';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/budgets`;

  private budgetsSubject = new BehaviorSubject<Budget[]>([]);
  budgets$ = this.budgetsSubject.asObservable();
   private cache$: Observable<DashboardSummary> | null = null;

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Budget API Error:', error);
    
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      errorMessage = `Server Error: ${error.status} - ${error.message}`;
      
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
          errorMessage = 'Budget endpoint not found.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }

  getAllBudgets(): Observable<Budget[]> {
    console.log('Fetching all budgets from:', this.apiUrl);
    
    return this.http.get<Budget[]>(this.apiUrl, { 
      headers: this.getHeaders() 
    }).pipe(
      shareReplay(1),
      tap((budgets: Budget[]) => {
        console.log('Budgets loaded successfully:', budgets);
        this.budgetsSubject.next(budgets);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  getBudgetById(id: string): Observable<Budget> {
    console.log(`Fetching budget with ID: ${id}`);
    
    return this.http.get<Budget>(`${this.apiUrl}/${id}`, { 
      headers: this.getHeaders() 
    }).pipe(
      tap((budget: Budget) => {
        console.log('Budget loaded:', budget);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  getBudgetsByMonth(month: number, year: number): Observable<Budget[]> {
    console.log(`Fetching budgets for ${month}/${year}`);
    
    return this.http.get<Budget[]>(`${this.apiUrl}/month/${month}/${year}`, { 
      headers: this.getHeaders() 
    }).pipe(
      tap((budgets: Budget[]) => {
        console.log('Monthly budgets loaded:', budgets);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  createBudget(data: BudgetRequest): Observable<Budget> {
    console.log('Creating new budget at:', this.apiUrl);
    console.log('Budget data:', data);
    
    const currentDate = new Date();
    
    const payload = {
      ...data,
      month: data.month || currentDate.getMonth() + 1,
      year: data.year || currentDate.getFullYear(),
      period: data.period || 'monthly',
      spent: data.spent || 0
    };
    
    return this.http.post<Budget>(this.apiUrl, payload, { 
      headers: this.getHeaders() 
    }).pipe(
      tap((newBudget: Budget) => {
        console.log('Budget created successfully:', newBudget);
        
        const currentBudgets = this.budgetsSubject.value;
        this.budgetsSubject.next([...currentBudgets, newBudget]);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  updateBudget(id: string, data: Partial<BudgetRequest>): Observable<Budget> {
    console.log(`Updating budget ${id} at:`, `${this.apiUrl}/${id}`);
    console.log('Update data:', data);
    
    return this.http.put<Budget>(`${this.apiUrl}/${id}`, data, { 
      headers: this.getHeaders() 
    }).pipe(
      tap((updatedBudget: Budget) => {
        console.log('Budget updated successfully:', updatedBudget);
        
        const currentBudgets = this.budgetsSubject.value;
        const index = currentBudgets.findIndex(b => b.id === id);
        
        if (index !== -1) {
          const updatedBudgets = [...currentBudgets];
          updatedBudgets[index] = updatedBudget;
          this.budgetsSubject.next(updatedBudgets);
        }
      }),
      catchError(this.handleError.bind(this))
    );
  }

  updateSpent(id: string, spent: number): Observable<Budget> {
    console.log(`Updating spent amount for budget ${id} to: ${spent}`);
    
    return this.http.patch<Budget>(`${this.apiUrl}/${id}/spent`, { spent }, { 
      headers: this.getHeaders() 
    }).pipe(
      tap((updatedBudget: Budget) => {
        console.log('Spent amount updated successfully:', updatedBudget);
        
        const currentBudgets = this.budgetsSubject.value;
        const index = currentBudgets.findIndex(b => b.id === id);
        
        if (index !== -1) {
          const updatedBudgets = [...currentBudgets];
          updatedBudgets[index] = updatedBudget;
          this.budgetsSubject.next(updatedBudgets);
        }
      }),
      catchError(this.handleError.bind(this))
    );
  }

  deleteBudget(id: string): Observable<any> {
    console.log(`Deleting budget ${id} at:`, `${this.apiUrl}/${id}`);
    
    return this.http.delete(`${this.apiUrl}/${id}`, { 
      headers: this.getHeaders(),
      responseType: 'text' as 'json'
    }).pipe(
      tap(() => {
        console.log('Budget deleted successfully:', id);
        
        const currentBudgets = this.budgetsSubject.value;
        this.budgetsSubject.next(currentBudgets.filter(b => b.id !== id));
      }),
      catchError(this.handleError.bind(this))
    );
  }

  getBudgetSummary(): Observable<BudgetSummary> {
    console.log('Fetching budget summary from:', `${this.apiUrl}/summary`);
    
    return this.http.get<BudgetSummary>(`${this.apiUrl}/summary`, { 
      headers: this.getHeaders() 
    }).pipe(
      tap((summary: BudgetSummary) => {
        console.log('Budget summary loaded:', summary);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  getBudgetProgress(): Observable<BudgetProgress[]> {
    console.log('Fetching budget progress from:', `${this.apiUrl}/progress`);
    
    return this.http.get<BudgetProgress[]>(`${this.apiUrl}/progress`, { 
      headers: this.getHeaders() 
    }).pipe(
      tap((progress: BudgetProgress[]) => {
        console.log('Budget progress loaded:', progress);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  checkBudgetAlerts(): Observable<any[]> {
    console.log('Checking budget alerts from:', `${this.apiUrl}/alerts`);
    
    return this.http.get<any[]>(`${this.apiUrl}/alerts`, { 
      headers: this.getHeaders() 
    }).pipe(
      tap((alerts: any[]) => {
        console.log('Budget alerts:', alerts);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  refreshBudgets(): void {
    this.getAllBudgets().subscribe();
  }

  clearCache(): void {
    this.budgetsSubject.next([]);
  }

  getCurrentBudgets(): Budget[] {
    return this.budgetsSubject.value;
  }

  calculateRemaining(budget: Budget): number {
    return budget.amount - budget.spent;
  }

  calculatePercentage(budget: Budget): number {
    if (budget.amount === 0) return 0;
    return Math.min((budget.spent / budget.amount) * 100, 100);
  }

  getStatus(budget: Budget): 'on-track' | 'warning' | 'exceeded' {
    const percentage = this.calculatePercentage(budget);
    if (percentage >= 100) return 'exceeded';
    if (percentage >= 80) return 'warning';
    return 'on-track';
  }

  getStatusColor(budget: Budget): string {
    const status = this.getStatus(budget);
    switch (status) {
      case 'exceeded': return '#EF4444';
      case 'warning': return '#F59E0B';
      default: return '#10B981';
    }
  }
}