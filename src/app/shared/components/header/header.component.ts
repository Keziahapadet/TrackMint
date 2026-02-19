import { Component, inject, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  private router      = inject(Router);
  private authService = inject(AuthService);
  private fb          = inject(FormBuilder);

  @Output() toggleSidebar = new EventEmitter<void>();

  searchForm!: FormGroup;
  currentDate: string    = '';
  userName: string       = 'John';
  showNotifications      = false;
  showSearchResults      = false;
  filteredResults: any[] = [];

  onHamburgerClick(event: Event): void {
    event.stopPropagation();
    this.toggleSidebar.emit();
  }

  notifications = [
    {
      id: '1',
      title: 'Budget Alert',
      message: 'Entertainment budget exceeded by 10%',
      time: '5 min ago',
      read: true,
      type: 'warning'
    },
    {
      id: '2',
      title: 'New Transaction',
      message: 'Salary deposit of $4,500.00',
      time: '2 hours ago',
      read: true,
      type: 'success'
    },
    {
      id: '3',
      title: 'Monthly Report',
      message: 'Your monthly report is ready',
      time: '1 day ago',
      read: true,
      type: 'info'
    }
  ];

  searchResults = [
    {
      type: 'transaction',
      title: 'Grocery Store',
      subtitle: '$85.50 - Food & Dining',
      route: '/user/transactions'
    },
    {
      type: 'category',
      title: 'Transportation',
      subtitle: '$420 spent this month',
      route: '/user/categories'
    },
    {
      type: 'budget',
      title: 'Shopping Budget',
      subtitle: '38% used',
      route: '/user/budgets'
    }
  ];

  ngOnInit(): void {
    this.initializeSearchForm();
    this.updateCurrentDate();
    this.loadUserData();
    this.setupSearchListener();
  }

  initializeSearchForm(): void {
    this.searchForm = this.fb.group({
      query: ['']
    });
  }

  setupSearchListener(): void {
    this.searchForm.get('query')?.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(query => this.handleSearch(query));
  }

  handleSearch(query: string): void {
    if (query && query.trim().length > 0) {
      this.showSearchResults = true;
      this.filteredResults   = this.searchResults.filter(result =>
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.subtitle.toLowerCase().includes(query.toLowerCase())
      );
    } else {
      this.showSearchResults = false;
      this.filteredResults   = [];
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

  selectSearchResult(result: any): void {
    this.router.navigate([result.route]);
    this.searchForm.reset();
    this.showSearchResults = false;
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  closeDropdowns(): void {
    this.showNotifications = false;
    this.showSearchResults = false;
  }

  markNotificationAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
  }

  clearAllNotifications(): void {
    this.notifications = [];
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }
}