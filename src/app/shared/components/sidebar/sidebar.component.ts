import { Component, inject, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  private router      = inject(Router);
  private authService = inject(AuthService);

  @Input() isOpen = false;
  @Output() closeSidebar = new EventEmitter<void>();

  menuItems = [
    { label: 'Dashboard',     icon: 'dashboard',               route: '/user/dashboard' },
    { label: 'Transactions',  icon: 'swap_horiz',              route: '/user/transactions' },
    { label: 'Budgets',       icon: 'account_balance_wallet',  route: '/user/budgets' },
    { label: 'Categories',    icon: 'category',                route: '/user/categories' },
    { label: 'Reports',       icon: 'assessment',              route: '/user/reports' },
    { label: 'Settings',      icon: 'settings',                route: '/user/settings' }
  ];

  userName: string  = 'John';
  userEmail: string = 'john.doe@example.com';
  userType: string  = 'Premium';

  ngOnInit(): void {
    this.loadUserData();
    this.listenToRouteChanges();
  }

  loadUserData(): void {
    const user = this.authService.getUser();
    if (user) {
      this.userName  = user.fullName?.split(' ')[0] || 'User';
      this.userEmail = user.email || 'user@example.com';
    }
  }

  listenToRouteChanges(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.closeSidebar.emit();
      });
  }

  isActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }

  navigate(route: string): void {
    this.router.navigate([route]);
  }

  navigateToProfile(): void {
    this.router.navigate(['/user/settings']);
  }

  onBackdropClick(): void {
    this.closeSidebar.emit();
  }
}