import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NotificationService } from '../../../services/notification.service';
import { Notification } from '../../../models/notification.interface';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class NotificationComponent implements OnInit, OnDestroy {
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();
  private cdr =inject(ChangeDetectorRef)

  showDropdown = false;
  unreadCount = 0;
  notifications: Notification[] = [];
  isLoading = false;

  ngOnInit(): void {
    this.loadNotifications();
    this.notificationService.startPolling(30000); 
    
    this.notificationService.unreadCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.unreadCount = count;
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadNotifications(): void {
    this.isLoading = true;
    this.notificationService.getNotificationSummary()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (summary) => {
          this.notifications = summary.recentNotifications.slice(0, 5);
          this.isLoading = false;
           this.cdr.markForCheck();
          
        },
        error: (error) => {
          console.error('Error loading notifications:', error);
          this.isLoading = false;
             this.cdr.markForCheck();
        }
      });
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
    if (this.showDropdown) {
      this.loadNotifications();
    }
    this.cdr.markForCheck();
  }

  closeDropdown(): void {
    this.showDropdown = false;
  }

  markAsRead(notification: Notification): void {
    if (!notification.read) {
      this.notificationService.markAsRead(notification.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe();
    }
    
    if (notification.link) {
      this.router.navigate([notification.link]);
      this.closeDropdown();
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notifications = this.notifications.map(n => ({ ...n, read: true }));
        }
      });
  }

  viewAllNotifications(): void {
    this.router.navigate(['/notifications']);
    this.closeDropdown();
  }

  deleteNotification(event: Event, id: string): void {
    event.stopPropagation();
    if (confirm('Delete this notification?')) {
      this.notificationService.deleteNotification(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe();
    }
  }

  getNotificationIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'BUDGET_ALERT': 'warning',
      'BUDGET_WARNING': 'priority_high',
      'BUDGET_EXCEEDED': 'error',
      'LARGE_TRANSACTION': 'payments',
      'WEEKLY_SUMMARY': 'summarize',
      'MONTHLY_SUMMARY': 'calendar_month',
      'GOAL_ACHIEVED': 'celebration',
      'SYSTEM': 'info'
    };
    return icons[type] || 'notifications';
  }

  getNotificationColor(type: string): string {
    const colors: { [key: string]: string } = {
      'BUDGET_ALERT': '#F59E0B',
      'BUDGET_WARNING': '#F59E0B',
      'BUDGET_EXCEEDED': '#EF4444',
      'LARGE_TRANSACTION': '#3B82F6',
      'WEEKLY_SUMMARY': '#10B981',
      'MONTHLY_SUMMARY': '#10B981',
      'GOAL_ACHIEVED': '#8B5CF6',
      'SYSTEM': '#6B7280'
    };
    return colors[type] || '#6B7280';
  }
}