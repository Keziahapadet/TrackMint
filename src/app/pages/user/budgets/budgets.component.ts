import { Component, inject, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { BudgetService } from '../../../services/budget.service';
import { Budget } from '../../../models/budget.interface';


@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './budgets.component.html',
  styleUrls: ['./budgets.component.scss'],
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class BudgetsComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private budgetService = inject(BudgetService);
  private destroy$ = new Subject<void>();
  private cdr = inject(ChangeDetectorRef)

  budgetForm!: FormGroup;
  showModal = false;
  isEditing = false;
  editingId = '';
  isLoading = false;
  errorMessage = '';

  categories = [
    { name: 'Food', icon: 'restaurant', color: '#10B981' },
    { name: 'Transportation', icon: 'directions_car', color: '#6366F1' },
    { name: 'Shopping', icon: 'shopping_cart', color: '#A855F7' },
    { name: 'Entertainment', icon: 'movie', color: '#EC4899' },
    { name: 'Bills & Utilities', icon: 'receipt', color: '#F59E0B' },
    { name: 'Healthcare', icon: 'local_hospital', color: '#14B8A6' },
    { name: 'Education', icon: 'school', color: '#8B5CF6' },
    { name: 'Travel', icon: 'flight', color: '#3B82F6' },
    { name: 'Shopping', icon: 'shopping_bag', color: '#EC4899' },
    { name: 'Gifts', icon: 'card_giftcard', color: '#F97316' }
  ];

  budgets: Budget[] = [];

  ngOnInit(): void {
    this.initForm();
    this.loadBudgets();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(): void {
    this.budgetForm = this.fb.group({
      category: ['Food', Validators.required],
      amount: ['', [Validators.required, Validators.min(1)]],
      spent: ['0']
    });
  }

  loadBudgets(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.budgetService.getAllBudgets()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (budgets) => {
          this.budgets = budgets;
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error loading budgets:', error);
          this.errorMessage = error.message;
          this.isLoading = false;
           this.cdr.markForCheck();
        }
      });
  }

  getCategoryIcon(category: string): string {
    const found = this.categories.find(c => c.name === category);
    return found ? found.icon : 'category';
  }

  getCategoryColor(category: string): string {
    const found = this.categories.find(c => c.name === category);
    return found ? found.color : '#10B981';
  }

  getPercentage(spent: number, amount: number): number {
    if (amount === 0) return 0;
    return Math.min(Math.round((spent / amount) * 100), 100);
  }

  getProgressWidth(spent: number, amount: number): number {
    if (amount === 0) return 0;
    return Math.min((spent / amount) * 100, 100);
  }

  isOverBudget(spent: number, amount: number): boolean {
    return spent > amount;
  }

  getProgressColor(spent: number, amount: number): string {
    if (amount === 0) return '#10B981';
    const pct = (spent / amount) * 100;
    if (pct >= 100) return '#EF4444';
    if (pct >= 80) return '#F59E0B';
    return '#10B981';
  }

  getRemaining(budget: Budget): number {
    return budget.amount - budget.spent;
  }

  getStatus(budget: Budget): string {
    const percentage = this.getPercentage(budget.spent, budget.amount);
    if (percentage >= 100) return 'exceeded';
    if (percentage >= 80) return 'warning';
    return 'on-track';
  }

  getCategoryByName(name: string) {
    return this.categories.find(c => c.name === name) || this.categories[0];
  }

  openModal(): void {
    this.showModal = true;
    this.isEditing = false;
    this.budgetForm.reset({
      category: 'Food',
      amount: '',
      spent: '0'
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditing = false;
    this.editingId = '';
    this.budgetForm.reset();
  }

  editBudget(budget: Budget): void {
    this.isEditing = true;
    this.editingId = budget.id;
    this.showModal = true;
    this.budgetForm.patchValue({
      category: budget.category,
      amount: budget.amount,
      spent: budget.spent
    });
  }

  deleteBudget(id: string): void {
    if (confirm('Are you sure you want to delete this budget?')) {
      this.budgetService.deleteBudget(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.budgets = this.budgets.filter(b => b.id !== id);
          },
          error: (error) => {
            console.error('Error deleting budget:', error);
            this.errorMessage = 'Failed to delete budget';
             this.cdr.markForCheck();
          }
        });
    }
  }

  saveBudget(): void {
    if (this.budgetForm.invalid) {
      Object.keys(this.budgetForm.controls).forEach(key => {
        this.budgetForm.get(key)?.markAsTouched();
      });
      return;
    }

    const formValue = this.budgetForm.value;
    const category = this.getCategoryByName(formValue.category);
    const amount = parseFloat(formValue.amount);
    const spent = parseFloat(formValue.spent) || 0;

    const payload = {
      category: formValue.category,
      amount: amount,
      spent: spent
    };

    this.isLoading = true;

    if (this.isEditing) {
      this.budgetService.updateBudget(this.editingId, payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadBudgets();
            this.closeModal();
            this.isLoading = false;
            this.cdr.markForCheck();
          },
          error: (error) => {
            console.error('Error updating budget:', error);
            this.errorMessage = 'Failed to update budget';
            this.isLoading = false;
            this.cdr.markForCheck();
          }
        });
    } else {
      this.budgetService.createBudget(payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadBudgets();
            this.closeModal();
            this.isLoading = false;
            this.cdr.markForCheck();
          },
          error: (error) => {
            console.error('Error creating budget:', error);
            this.errorMessage = 'Failed to create budget';
            this.isLoading = false;
            this.cdr.markForCheck();
          }
        });
    }
  }

  retryLoading(): void {
    this.loadBudgets();
  }
}