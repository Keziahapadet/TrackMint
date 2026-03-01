import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { BehaviorSubject, Observable, tap, catchError, throwError, interval, switchMap } from 'rxjs';
import { Notification, NotificationSummary, NotificationType } from '../models/notification.interface';

import { environment } from '../../environment/environment';
import { NOTIFICATION_COLORS, NOTIFICATION_ICONS } from '../constants/notification.constants';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/notifications`;

  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Notification API Error:', error);
    
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
          errorMessage = 'Notifications endpoint not found.';
          break;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }

  private enhanceNotification(notification: Notification): Notification {
    return {
      ...notification,
      icon: NOTIFICATION_ICONS[notification.type as NotificationType] || 'notifications',
      color: NOTIFICATION_COLORS[notification.type as NotificationType] || '#6B7280',
      timeAgo: this.calculateTimeAgo(notification.createdAt)
    };
  }

  private calculateTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  startPolling(intervalMs: number = 30000): void {
    interval(intervalMs).pipe(
      switchMap(() => this.getUnreadCount())
    ).subscribe();
  }

  getAllNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.apiUrl, { 
      headers: this.getHeaders() 
    }).pipe(
      tap((notifications: Notification[]) => {
        const enhanced = notifications.map(n => this.enhanceNotification(n));
        this.notificationsSubject.next(enhanced);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  getUnreadNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/unread`, { 
      headers: this.getHeaders() 
    }).pipe(
      tap((notifications: Notification[]) => {
        const enhanced = notifications.map(n => this.enhanceNotification(n));
      }),
      catchError(this.handleError.bind(this))
    );
  }

  getUnreadCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count`, { 
      headers: this.getHeaders() 
    }).pipe(
      tap((count: number) => {
        this.unreadCountSubject.next(count);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  getNotificationSummary(): Observable<NotificationSummary> {
    return this.http.get<NotificationSummary>(`${this.apiUrl}/summary`, { 
      headers: this.getHeaders() 
    }).pipe(
      tap((summary: NotificationSummary) => {
        summary.recentNotifications = summary.recentNotifications.map(n => this.enhanceNotification(n));
        summary.unreadNotifications = summary.unreadNotifications.map(n => this.enhanceNotification(n));
        this.unreadCountSubject.next(summary.unreadCount);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  markAsRead(id: string): Observable<Notification> {
    return this.http.put<Notification>(`${this.apiUrl}/${id}/read`, {}, { 
      headers: this.getHeaders() 
    }).pipe(
      tap((updatedNotification: Notification) => {
        const current = this.notificationsSubject.value;
        const index = current.findIndex(n => n.id === id);
        if (index !== -1) {
          current[index] = this.enhanceNotification(updatedNotification);
          this.notificationsSubject.next([...current]);
        }
        this.getUnreadCount().subscribe();
      }),
      catchError(this.handleError.bind(this))
    );
  }

  markAllAsRead(): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/read-all`, {}, { 
      headers: this.getHeaders() 
    }).pipe(
      tap(() => {
        const current = this.notificationsSubject.value.map(n => ({ ...n, read: true }));
        this.notificationsSubject.next(current);
        this.unreadCountSubject.next(0);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  deleteNotification(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { 
      headers: this.getHeaders() 
    }).pipe(
      tap(() => {
        const current = this.notificationsSubject.value.filter(n => n.id !== id);
        this.notificationsSubject.next(current);
        this.getUnreadCount().subscribe();
      }),
      catchError(this.handleError.bind(this))
    );
  }

  deleteOldNotifications(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/old`, { 
      headers: this.getHeaders() 
    }).pipe(
      tap(() => {
        this.getAllNotifications().subscribe();
      }),
      catchError(this.handleError.bind(this))
    );
  }

  refreshNotifications(): void {
    this.getNotificationSummary().subscribe();
  }

  clearCache(): void {
    this.notificationsSubject.next([]);
    this.unreadCountSubject.next(0);
  }
}