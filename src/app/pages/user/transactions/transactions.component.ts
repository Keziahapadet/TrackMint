import { Component, inject, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { TransactionService } from '../../../services/transaction.service';
import { Transaction, TransactionRequest } from '../../../models/transaction.interface';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss'],
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class TransactionsComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private transactionService = inject(TransactionService);
  private destroy$ = new Subject<void>();
  private cdr = inject(ChangeDetectorRef)

  transactionForm!: FormGroup;
  filterForm!: FormGroup;

  showModal = false;
  isEditing = false;
  editingId = '';
  isLoading = false;
  errorMessage = '';

  Math = Math;

  categories = [
    { name: 'Food & Dining', icon: 'restaurant', color: '#10B981' },
    { name: 'Transportation', icon: 'directions_car', color: '#6366F1' },
    { name: 'Shopping', icon: 'shopping_cart', color: '#A855F7' },
    { name: 'Entertainment', icon: 'movie', color: '#EC4899' },
    { name: 'Bills & Utilities', icon: 'receipt', color: '#F59E0B' },
    { name: 'Healthcare', icon: 'local_hospital', color: '#14B8A6' },
    { name: 'Income', icon: 'attach_money', color: '#10B981' }
  ];

  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];

  ngOnInit(): void {
    this.initForms();
    this.loadTransactions();
    
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['action'] === 'add') {
          this.openModal();
        }
      });

    this.filterForm.get('category')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.applyFilters();
      });

    this.filterForm.get('period')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.applyFilters();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForms(): void {
    this.transactionForm = this.fb.group({
      description: ['', Validators.required],
      category: ['Food & Dining', Validators.required],
      type: ['expense', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      date: [new Date().toISOString().split('T')[0], Validators.required]
    });

    this.filterForm = this.fb.group({
      category: ['All Categories'],
      period: ['This Month']
    });
  }

  loadTransactions(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.transactionService.getAllTransactions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (transactions) => {
          this.transactions = transactions;
          this.applyFilters();
          this.isLoading = false;
           this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error loading transactions:', error);
          this.errorMessage = 'Failed to load transactions. Please try again.';
          this.isLoading = false;
           this.cdr.markForCheck();
        }
      });
  }

  applyFilters(): void {
    const categoryFilter = this.filterForm.get('category')?.value;
    const periodFilter = this.filterForm.get('period')?.value;
    
    let filtered = [...this.transactions];
    
    if (categoryFilter !== 'All Categories') {
      filtered = filtered.filter(t => t.category === categoryFilter);
    }
    
    if (periodFilter !== 'All Periods') {
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.date);
        
        switch(periodFilter) {
          case 'This Month':
            return transactionDate.getMonth() === currentMonth && 
                   transactionDate.getFullYear() === currentYear;
          case 'Last Month':
            const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
            return transactionDate.getMonth() === lastMonth && 
                   transactionDate.getFullYear() === lastMonthYear;
          case 'This Year':
            return transactionDate.getFullYear() === currentYear;
          default:
            return true;
        }
      });
    }
    
    this.filteredTransactions = filtered;
  }

  getCategoryIcon(categoryName: string): string {
    const category = this.categories.find(c => c.name === categoryName);
    return category ? category.icon : 'receipt';
  }

  getCategoryColor(categoryName: string): string {
    const category = this.categories.find(c => c.name === categoryName);
    return category ? category.color : '#999';
  }

  openModal(): void {
    this.showModal = true;
    this.isEditing = false;
    this.editingId = '';
    this.transactionForm.reset({
      description: '',
      category: 'Food & Dining',
      type: 'expense',
      amount: '',
      date: new Date().toISOString().split('T')[0]
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditing = false;
    this.editingId = '';
    this.errorMessage = '';
    this.transactionForm.reset();
  }

  editTransaction(transaction: Transaction): void {
    this.isEditing = true;
    this.editingId = transaction.id;
    this.showModal = true;
    
    const uiType = transaction.type === 'INCOME' ? 'income' : 'expense';
    
    this.transactionForm.patchValue({
      description: transaction.description,
      category: transaction.category,
      type: uiType,
      amount: Math.abs(transaction.amount),
      date: transaction.date.split('T')[0]
    });
  }

  deleteTransaction(id: string): void {
    if (confirm('Are you sure you want to delete this transaction?')) {
      this.transactionService.deleteTransaction(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.transactions = this.transactions.filter(t => t.id !== id);
            this.applyFilters();
          },
          error: (error) => {
            console.error('Error deleting transaction:', error);
            this.errorMessage = 'Failed to delete transaction. Please try again.';
            this.cdr.markForCheck();
          }
        });
    }
  }

  saveTransaction(): void {
    if (this.transactionForm.invalid) {
      Object.keys(this.transactionForm.controls).forEach(key => {
        this.transactionForm.get(key)?.markAsTouched();
      });
      return;
    }

    const formValue = this.transactionForm.value;
    
    const apiType = formValue.type === 'income' ? 'INCOME' : 'EXPENSE';
    
    const amount = Math.abs(parseFloat(formValue.amount));

    const date = new Date(formValue.date);
    const formattedDate = date.toISOString();

    const payload: TransactionRequest = {
      description: formValue.description,
      category: formValue.category,
      type: apiType,
      amount: amount,
      date: formattedDate
    };

    this.isLoading = true;
    this.errorMessage = '';

    const request$ = this.isEditing
      ? this.transactionService.updateTransaction(this.editingId, payload)
      : this.transactionService.createTransaction(payload);

    request$.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.loadTransactions();
        this.closeModal();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error saving transaction:', error);
        this.errorMessage = 'Failed to save transaction. Please try again.';
        this.isLoading = false;
         this.cdr.markForCheck();
      }
    });
  }
}