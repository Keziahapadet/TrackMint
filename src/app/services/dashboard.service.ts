import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, catchError, shareReplay, throwError } from 'rxjs';
import { environment } from '../../environment/environment';
import { DashboardSummary } from '../models/dashboard.interface';


@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/dashboard`;
  private cache$: Observable<DashboardSummary> | null = null

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

 getDashboardSummary(): Observable<DashboardSummary> {
    if (!this.cache$) {                                             
      this.cache$ = this.http.get<DashboardSummary>(`${this.apiUrl}/summary`, {
        headers: this.getHeaders()
      }).pipe(
        shareReplay(1),                                            
        catchError(this.handleError)
      );
    }
    return this.cache$;                                             
  }

  clearCache(): void {                                               
    this.cache$ = null;
  }


  private handleError(error: any) {
    console.error('Dashboard API Error:', error);
    let errorMessage = 'Failed to load dashboard data';
    
    if (error.status === 401) {
      errorMessage = 'Session expired. Please login again.';
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (error.status === 403) {
      errorMessage = 'Access denied. Please login again.';
    } else if (error.status === 404) {
      errorMessage = 'Dashboard endpoint not found';
    }
    
    return throwError(() => new Error(errorMessage));
  }
}