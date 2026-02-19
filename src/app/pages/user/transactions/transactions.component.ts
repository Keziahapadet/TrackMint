

import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { TransactionService } from '../../../services/transaction.service';
import { Transaction, TransactionRequest } from '../../../models/transaction.interface';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit, OnDestroy {
  private fb                 = inject(FormBuilder);
  private route              = inject(ActivatedRoute);
  private transactionService = inject(TransactionService);
  private destroy$           = new Subject<void>();

  transactionForm!: FormGroup;
  filterForm!: FormGroup;

  showModal    = false;
  isEditing    = false;
  editingId    = '';
  isLoading    = false;
  errorMessage = '';

 
  Math = Math;

  categories = [
    { name: 'Food & Dining',     icon: 'restaurant', color: '#10B981' },
    { name: 'Transportation',    icon: 'directions_car', color: '#6366F1' },
    { name: 'Shopping',          icon: 'shopping_cart', color: '#A855F7' },
    { name: 'Entertainment',     icon: 'movie', color: '#EC4899' },
    { name: 'Bills & Utilities', icon: 'receipt', color: '#F59E0B' },
    { name: 'Healthcare',        icon: 'local_hospital', color: '#14B8A6' },
    { name: 'Income',            icon: 'attach_money', color: '#10B981' }
  ];

  transactions: Transaction[]         = [];
  filteredTransactions: Transaction[] = [];

  ngOnInit(): void {
    this.initForms();
    this.loadTransactions();
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['action'] === 'add') this.openModal();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForms(): void {
    this.transactionForm = this.fb.group({
      description: ['', Validators.required],
      category:    ['Food & Dining', Validators.required],
      type:        ['expense', Validators.required],
      amount:      ['', [Validators.required, Validators.min(0.01)]],
      date:        [new Date().toISOString().split('T')[0], Validators.required]
    });

    this.filterForm = this.fb.group({
      category: ['All Categories'],
      period:   ['This Month']
    });

    this.filterForm.get('category')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(selectedCategory => {
        this.filteredTransactions = selectedCategory === 'All Categories'
          ? this.transactions
          : this.transactions.filter(transaction => transaction.category === selectedCategory);
      });
  }

  loadTransactions(): void {
    this.isLoading = true;
    this.transactionService.getAllTransactions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (transactions) => {
          this.transactions         = transactions;
          this.filteredTransactions = transactions;
          this.isLoading            = false;
        },
        error: () => {
          this.errorMessage = 'Failed to load transactions';
          this.isLoading    = false;
        }
      });
  }

  getCategoryIcon(categoryName: string): string {
    const category = this.categories.find(c => c.name === categoryName);
    return category ? category.icon : 'receipt';
  }

  getCategoryByName(name: string) {
    return this.categories.find(category => category.name === name) ?? this.categories[0];
  }

  openModal(): void {
    this.showModal = true;
    this.isEditing = false;
    this.transactionForm.reset({
      description: '',
      category:    'Food & Dining',
      type:        'expense',
      amount:      '',
      date:        new Date().toISOString().split('T')[0]
    });
  }

  closeModal(): void {
    this.showModal    = false;
    this.isEditing    = false;
    this.editingId    = '';
    this.errorMessage = '';
    this.transactionForm.reset();
  }

  editTransaction(transaction: Transaction): void {
    this.isEditing = true;
    this.editingId = transaction.id;
    this.showModal = true;
    this.transactionForm.patchValue({
      description: transaction.description,
      category:    transaction.category,
      type:        transaction.type,
      amount:      Math.abs(transaction.amount),
      date:        transaction.date.split('T')[0] 
    });
  }

  deleteTransaction(id: string): void {
    if (confirm('Are you sure you want to delete this transaction?')) {
      this.transactionService.deleteTransaction(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.transactions         = this.transactions.filter(transaction => transaction.id !== id);
            this.filteredTransactions = this.filteredTransactions.filter(transaction => transaction.id !== id);
          },
          error: () => {
            this.errorMessage = 'Failed to delete transaction';
          }
        });
    }
  }

  saveTransaction(): void {
    if (this.transactionForm.invalid) return;

    const formValue = this.transactionForm.value;
    const category  = this.getCategoryByName(formValue.category);
    const amount    = formValue.type === 'expense'
                      ? -Math.abs(parseFloat(formValue.amount))
                      :  Math.abs(parseFloat(formValue.amount));

    const payload: TransactionRequest = {
      description: formValue.description,
      category:    formValue.category,
      type:        formValue.type,
      amount:      amount,
      date:        formValue.date
    };

    this.isLoading = true;

    const request$ = this.isEditing
      ? this.transactionService.updateTransaction(this.editingId, payload)
      : this.transactionService.createTransaction(payload);

    request$.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.loadTransactions();
        this.closeModal();
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to save transaction';
        this.isLoading    = false;
      }
    });
  }
}