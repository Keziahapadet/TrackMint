

import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-dashboard',
  imports:[CommonModule,HeaderComponent,SidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private router = inject(Router);


  summaryCards = [
    {
      title: 'Total Balance',
      amount: 24563.00,
      percentage: '+12.5%',
      trend: 'up',
      icon: 'account_balance_wallet',
      color: '#10B981'
    },
    {
      title: 'Income',
      amount: 8350.00,
      percentage: '+8.2%',
      trend: 'up',
      icon: 'trending_up',
      color: '#10B981'
    },
    {
      title: 'Expenses',
      amount: 4125.00,
      percentage: '-3.7%',
      trend: 'down',
      icon: 'trending_down',
      color: '#EF4444'
    },
    {
      title: 'Savings',
      amount: 4225.00,
      percentage: '+5.4%',
      trend: 'up',
      icon: 'savings',
      color: '#6366F1'
    }
  ];


  categorySpending = [
    { name: 'Food & Dining', amount: 850, color: '#10B981' },
    { name: 'Transportation', amount: 420, color: '#6366F1' },
    { name: 'Shopping', amount: 680, color: '#A855F7' },
    { name: 'Entertainment', amount: 320, color: '#EC4899' },
    { name: 'Bills & Utilities', amount: 1200, color: '#F59E0B' }
  ];


  recentTransactions = [
    {
      id: '1',
      description: 'Grocery Store',
      category: 'Food & Dining',
      amount: -85.50,
      date: 'Today, 2:30 PM',
      icon: 'shopping_cart',
      color: '#10B981'
    },
    {
      id: '2',
      description: 'Salary Deposit',
      category: 'Income',
      amount: 4500.00,
      date: 'Yesterday, 9:00 AM',
      icon: 'account_balance',
      color: '#10B981'
    },
    {
      id: '3',
      description: 'Gas Station',
      category: 'Transportation',
      amount: -45.00,
      date: 'Yesterday, 6:45 PM',
      icon: 'local_gas_station',
      color: '#6366F1'
    },
    {
      id: '4',
      description: 'Netflix Subscription',
      category: 'Entertainment',
      amount: -15.99,
      date: 'Jan 15, 12:00 AM',
      icon: 'movie',
      color: '#EC4899'
    },
    {
      id: '5',
      description: 'Rent Payment',
      category: 'Bills & Utilities',
      amount: -1200.00,
      date: 'Jan 1, 8:00 AM',
      icon: 'home',
      color: '#F59E0B'
    }
  ];

  
  spendingChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    values: [120, 200, 150, 300, 180, 250, 220]
  };

  selectedPeriod: string = 'This Month';

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    console.log('Loading dashboard data...');
  }

  viewAllTransactions(): void {
    this.router.navigate(['/user/transactions']);
  }

  navigateToCategory(categoryName: string): void {
    this.router.navigate(['/user/categories']);
  }

  addTransaction(): void {
    this.router.navigate(['/user/transactions'], { 
      queryParams: { action: 'add' } 
    });
  }

  changePeriod(period: string): void {
    this.selectedPeriod = period;
   
  }

  getTotalSpending(): number {
    return this.categorySpending.reduce((sum, cat) => sum + cat.amount, 0);
  }

  getCategoryPercentage(amount: number): number {
    const total = this.getTotalSpending();
    return total > 0 ? (amount / total) * 100 : 0;
  }
}