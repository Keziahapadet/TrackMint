
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './budgets.component.html',
  styleUrls: ['./budgets.component.scss']
})
export class BudgetsComponent implements OnInit {
  private fb = inject(FormBuilder);

   budgetForm!: FormGroup;

  showModal = false;
  isEditing = false;
  editingId = '';
  
  
 
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

 
  budgets = [
    {
      id: '1',
      category: 'Food',
      icon: 'restaurant',
      amount: 800,
      spent: 680,
      color: '#10B981'
    },
    {
      id: '2',
      category: 'Transportation',
      icon: 'directions_car',
      amount: 500,
      spent: 320,
      color: '#6366F1'
    },
    {
      id: '3',
      category: 'Shopping',
      icon: 'shopping_cart',
      amount: 400,
      spent: 150,
      color: '#A855F7'
    },
    {
      id: '4',
      category: 'Entertainment',
      icon: 'movie',
      amount: 200,
      spent: 220,
      color: '#EC4899'
    },
    {
      id: '5',
      category: 'Bills & Utilities',
      icon: 'receipt',
      amount: 600,
      spent: 450,
      color: '#F59E0B'
    },
    {
      id: '6',
      category: 'Healthcare',
      icon: 'local_hospital',
      amount: 300,
      spent: 120,
      color: '#14B8A6'
    }
  ];

  ngOnInit(): void {
    this.initForm();
  }


  initForm(): void {
    this.budgetForm = this.fb.group({
      category: ['Food', Validators.required],
      amount: ['', [Validators.required, Validators.min(1)]],
      spent: ['0']
    });
  }

  
  getCategoryIcon(category: string): string {
    const found = this.categories.find(c => c.name === category);
    return found ? found.icon : 'category';
  }

 
  getPercentage(spent: number, amount: number): number {
    if (amount === 0) return 0;
    return Math.round((spent / amount) * 100);
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


  editBudget(budget: any): void {
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
      this.budgets = this.budgets.filter(b => b.id !== id);
    }
  }


  saveBudget(): void {
    if (this.budgetForm.valid) {
      const formValue = this.budgetForm.value;
      const category = this.getCategoryByName(formValue.category);
      const amount = parseFloat(formValue.amount);
      const spent = parseFloat(formValue.spent) || 0;

      if (this.isEditing) {
        
        const index = this.budgets.findIndex(b => b.id === this.editingId);
        if (index !== -1) {
          this.budgets[index] = {
            ...this.budgets[index],
            category: formValue.category,
            icon: category.icon,
            amount: amount,
            spent: spent,
            color: category.color
          };
        }
      } else {
        
        this.budgets.push({
          id: Date.now().toString(),
          category: formValue.category,
          icon: category.icon,
          amount: amount,
          spent: spent,
          color: category.color
        });
      }

      this.closeModal();
    }
  }
}