import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../environment/environment';
import { Category, CategoryRequest, CategorySummary } from '../models/category.interface';


@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/categories`;

  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  categories$ = this.categoriesSubject.asObservable();

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Category API Error:', error);
    
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
          errorMessage = 'Access forbidden.';
          break;
        case 404:
          errorMessage = 'Categories endpoint not found.';
          break;
        case 409:
          errorMessage = 'Category already exists.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }

  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl, { 
      headers: this.getHeaders() 
    }).pipe(
      tap((categories: Category[]) => {
        this.categoriesSubject.next(categories);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  getCategoryById(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`, { 
      headers: this.getHeaders() 
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  getCategoryWithDetails(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}/details`, { 
      headers: this.getHeaders() 
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  createCategory(data: CategoryRequest): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, data, { 
      headers: this.getHeaders() 
    }).pipe(
      tap((newCategory: Category) => {
        const currentCategories = this.categoriesSubject.value;
        this.categoriesSubject.next([...currentCategories, newCategory]);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  updateCategory(id: string, data: Partial<CategoryRequest>): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/${id}`, data, { 
      headers: this.getHeaders() 
    }).pipe(
      tap((updatedCategory: Category) => {
        const currentCategories = this.categoriesSubject.value;
        const index = currentCategories.findIndex(c => c.id === id);
        
        if (index !== -1) {
          const updatedCategories = [...currentCategories];
          updatedCategories[index] = updatedCategory;
          this.categoriesSubject.next(updatedCategories);
        }
      }),
      catchError(this.handleError.bind(this))
    );
  }

  deleteCategory(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { 
      headers: this.getHeaders(),
      responseType: 'text' as 'json'
    }).pipe(
      tap(() => {
        const currentCategories = this.categoriesSubject.value;
        this.categoriesSubject.next(currentCategories.filter(c => c.id !== id));
      }),
      catchError(this.handleError.bind(this))
    );
  }

  getCategorySummary(): Observable<CategorySummary> {
    return this.http.get<CategorySummary>(`${this.apiUrl}/summary`, { 
      headers: this.getHeaders() 
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  refreshCategories(): void {
    this.getAllCategories().subscribe();
  }

  clearCache(): void {
    this.categoriesSubject.next([]);
  }

  getCurrentCategories(): Category[] {
    return this.categoriesSubject.value;
  }
}