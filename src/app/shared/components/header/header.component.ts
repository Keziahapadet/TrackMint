import { Component, inject, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { NotificationComponent } from '../notification/notification.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NotificationComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private fb = inject(FormBuilder);
  private destroy$ = new Subject<void>();

  @Output() toggleSidebar = new EventEmitter<void>();

  searchForm!: FormGroup;
  currentDate: string = '';
  userName: string = 'John';
  showNotifications = false;
  showSearchResults = false;
  filteredResults: any[] = [];
  unreadCount = 0;

  
  notifications: any[] = [];
  
  searchResults = [
    {
      type: 'transaction',
      title: 'Grocery Store',
      subtitle: 'ksh 85.50 - Food & Dining',
      route: '/user/transactions'
    },
    {
      type: 'category',
      title: 'Transportation',
      subtitle: 'ksh 420 spent this month',
      route: '/user/categories'
    },
    {
      type: 'budget',
      title: 'Shopping Budget',
      subtitle: '38% used',
      route: '/user/budgets'
    },
    {
      type: 'transaction',
      title: 'Salary Deposit',
      subtitle: 'ksh 50,000 - Income',
      route: '/user/transactions'
    },
    {
      type: 'category',
      title: 'Food & Dining',
      subtitle: 'ksh 850 spent this month',
      route: '/user/categories'
    }
  ];

  onHamburgerClick(event: Event): void {
    event.stopPropagation();
    this.toggleSidebar.emit();
  }

  ngOnInit(): void {
    this.initializeSearchForm();
    this.updateCurrentDate();
    this.loadUserData();
    this.setupSearchListener();
    this.loadNotifications();
    this.subscribeToUnreadCount();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializeSearchForm(): void {
    this.searchForm = this.fb.group({
      query: ['']
    });
  }

  setupSearchListener(): void {
    this.searchForm.get('query')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(query => this.handleSearch(query));
  }

  handleSearch(query: string): void {
    if (query && query.trim().length > 0) {
      this.showSearchResults = true;
      this.filteredResults = this.searchResults.filter(result =>
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.subtitle.toLowerCase().includes(query.toLowerCase())
      );
    } else {
      this.showSearchResults = false;
      this.filteredResults = [];
    }
  }

  updateCurrentDate(): void {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    this.currentDate = today.toLocaleDateString('en-US', options);
  }

  loadUserData(): void {
    const user = this.authService.getUser();
    if (user) {
      this.userName = user.fullName || user.name || 'John';
    }
  }

  loadNotifications(): void {
    this.notificationService.getNotificationSummary()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (summary) => {
          this.notifications = summary.recentNotifications;
        },
        error: (error) => {
          console.error('Error loading notifications:', error);
        }
      });
  }

  subscribeToUnreadCount(): void {
    this.notificationService.unreadCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.unreadCount = count;
      });
  }

  selectSearchResult(result: any): void {
    this.router.navigate([result.route]);
    this.searchForm.reset();
    this.showSearchResults = false;
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.loadNotifications();
    }
  }

  closeDropdowns(): void {
    this.showNotifications = false;
    this.showSearchResults = false;
  }

  markNotificationAsRead(id: string): void {
    this.notificationService.markAsRead(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadNotifications();
        },
        error: (error) => {
          console.error('Error marking notification as read:', error);
        }
      });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadNotifications();
        },
        error: (error) => {
          console.error('Error marking all as read:', error);
        }
      });
  }

  clearAllNotifications(): void {
    this.notifications.forEach(n => {
      if (!n.read) {
        this.notificationService.deleteNotification(n.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe();
      }
    });
    setTimeout(() => this.loadNotifications(), 500);
  }

  viewAllNotifications(): void {
    this.router.navigate(['/notifications']);
    this.showNotifications = false;
  }
}