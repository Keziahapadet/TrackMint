import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { DashboardService } from '../../../services/dashboard.service';
import { CategorySpending, DashboardSummary } from '../../../models/dashboard.interface';


@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private dashboardService = inject(DashboardService);
  private destroy$ = new Subject<void>();
    private cdr = inject(ChangeDetectorRef);

  summaryCards: any[] = [];
  categorySpending: CategorySpending[] = [];
  recentTransactions: any[] = [];
  spendingChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    values: [0, 0, 0, 0, 0, 0, 0]
  };

  selectedPeriod: string = 'This Month';
  isLoading: boolean = true;
  errorMessage: string = '';

  categoryColors = [
    '#10B981', '#6366F1', '#A855F7', '#EC4899', '#F59E0B',
    '#EF4444', '#3B82F6', '#14B8A6', '#8B5CF6', '#F97316'
  ];

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    console.log('Loading dashboard data...');

    this.dashboardService.getDashboardSummary()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: DashboardSummary) => {
          console.log('Data received, updating UI...', data);
          
          try {
            this.updateSummaryCards(data);
            console.log('Summary cards updated');
            
            this.updateCategorySpending(data.categorySpending);
            console.log('Category spending updated');
            
            this.updateRecentTransactions(data.recentTransactions);
            console.log('Recent transactions updated');
            
            this.updateWeeklyChart(data.weeklySpending);
            console.log('Weekly chart updated');
            
            this.isLoading = false;
            console.log('Loading complete!');
          } catch (error) {
            console.error('Error updating UI:', error);
            this.errorMessage = 'Error displaying dashboard data';
            this.isLoading = false;
            this.cdr.markForCheck();
          }
        },
        error: (error) => {
          console.error('Error loading dashboard:', error);
          this.errorMessage = error.message || 'Failed to load dashboard data';
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
  }

  private updateSummaryCards(data: DashboardSummary): void {
    this.summaryCards = [
      {
        title: 'Total Balance',
        amount: data.totalBalance || 0,
        percentage: this.calculatePercentageChange(data.totalBalance),
        trend: data.totalBalance >= 0 ? 'up' : 'down',
        icon: 'account_balance_wallet',
        color: '#10B981'
      },
      {
        title: 'Income',
        amount: data.totalIncome || 0,
        percentage: '+0%',
        trend: 'up',
        icon: 'trending_up',
        color: '#10B981'
      },
      {
        title: 'Expenses',
        amount: data.totalExpenses || 0,
        percentage: '-0%',
        trend: 'down',
        icon: 'trending_down',
        color: '#EF4444'
      },
      {
        title: 'Savings',
        amount: data.totalSavings || 0,
        percentage: data.totalSavings > 0 ? '+0%' : '-0%',
        trend: data.totalSavings > 0 ? 'up' : 'down',
        icon: 'savings',
        color: '#6366F1'
      }
    ];
  }

  private calculatePercentageChange(value: number): string {
    return value > 0 ? '+0%' : '-0%';
  }

  private updateCategorySpending(spending: { [key: string]: number }): void {
    if (!spending) {
      this.categorySpending = [];
      return;
    }
    
    const total = Object.values(spending).reduce((sum, amount) => sum + (amount || 0), 0);
    
    this.categorySpending = Object.entries(spending).map(([name, amount], index) => ({
      name: name,
      amount: amount || 0,
      color: this.categoryColors[index % this.categoryColors.length],
      percentage: total > 0 ? ((amount || 0) / total) * 100 : 0
    }));
  }

  private updateRecentTransactions(transactions: any[]): void {
    if (!transactions) {
      this.recentTransactions = [];
      return;
    }
    
    this.recentTransactions = transactions.map(t => ({
      id: t.id,
      description: t.description || '',
      category: t.category || '',
      amount: t.amount || 0,
      date: this.formatDate(t.date),
      icon: this.getCategoryIcon(t.category),
      color: this.getCategoryColor(t.category)
    }));
  }

  private updateWeeklyChart(weeklyData: { [key: string]: number }): void {
    if (!weeklyData) {
      return;
    }
    
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    this.spendingChartData = {
      labels: days,
      values: days.map(day => weeklyData[day] || 0)
    };
  }

  private getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'Food & Dining': 'restaurant',
      'Transportation': 'directions_car',
      'Shopping': 'shopping_cart',
      'Entertainment': 'movie',
      'Bills & Utilities': 'receipt',
      'Healthcare': 'local_hospital',
      'Income': 'attach_money'
    };
    return icons[category] || 'receipt';
  }

  private getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      'Food & Dining': '#10B981',
      'Transportation': '#6366F1',
      'Shopping': '#A855F7',
      'Entertainment': '#EC4899',
      'Bills & Utilities': '#F59E0B',
      'Healthcare': '#14B8A6',
      'Income': '#10B981'
    };
    return colors[category] || '#999';
  }

  private formatDate(dateString: string): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }

  getMaxChartValue(): number {
    return Math.max(...this.spendingChartData.values, 1);
  }

  viewAllTransactions(): void {
    this.router.navigate(['/user/transactions']);
  }

  navigateToCategory(categoryName: string): void {
    this.router.navigate(['/user/categories'], { 
      queryParams: { category: categoryName } 
    });
  }

  addTransaction(): void {
    this.router.navigate(['/user/transactions'], { 
      queryParams: { action: 'add' } 
    });
  }

  changePeriod(period: string): void {
    this.selectedPeriod = period;
    this.loadDashboardData();
  }

  getTotalSpending(): number {
    return this.categorySpending.reduce((sum, cat) => sum + (cat.amount || 0), 0);
  }

  getCategoryPercentage(amount: number): number {
    const total = this.getTotalSpending();
    return total > 0 ? ((amount || 0) / total) * 100 : 0;
  }

  retryLoading(): void {
    this.loadDashboardData();
  }
}