import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { CATEGORY_COLORS, CATEGORY_ICONS } from '../../../constants/category.constants';
import { CategoryService } from '../../../services/category.component';
import { Category } from '../../../models/category.interface';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private categoryService = inject(CategoryService);
  private destroy$ = new Subject<void>();

  // Constants for UI
  colors = CATEGORY_COLORS;
  icons = CATEGORY_ICONS;
  
  // Form
  categoryForm!: FormGroup;
  
  // UI State
  showModal = false;
  isEditing = false;
  editingId = '';
  isLoading = false;
  errorMessage = '';
  
  // Selected values for preview
  selectedColor = '#10B981';
  selectedIcon = 'restaurant';

  // Data from backend
  categories: Category[] = [];

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(): void {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      icon: ['restaurant', Validators.required],
      color: ['#10B981', Validators.required]
    });
  }

  loadCategories(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.categoryService.getAllCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories) => {
          this.categories = categories;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading categories:', error);
          this.errorMessage = error.message;
          this.isLoading = false;
        }
      });
  }

  selectColor(color: string): void {
    this.selectedColor = color;
    this.categoryForm.patchValue({ color });
  }

  selectIcon(icon: string): void {
    this.selectedIcon = icon;
    this.categoryForm.patchValue({ icon });
  }

  openModal(): void {
    this.showModal = true;
    this.isEditing = false;
    this.selectedColor = '#10B981';
    this.selectedIcon = 'restaurant';
    this.categoryForm.reset({
      name: '',
      icon: 'restaurant',
      color: '#10B981'
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditing = false;
    this.editingId = '';
    this.categoryForm.reset();
  }

  editCategory(category: Category): void {
    this.isEditing = true;
    this.editingId = category.id;
    this.selectedColor = category.color;
    this.selectedIcon = category.icon;
    this.showModal = true;
    this.categoryForm.patchValue({
      name: category.name,
      icon: category.icon,
      color: category.color
    });
  }

  deleteCategory(id: string): void {
    if (confirm('Are you sure you want to delete this category?')) {
      this.categoryService.deleteCategory(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.categories = this.categories.filter(c => c.id !== id);
          },
          error: (error) => {
            console.error('Error deleting category:', error);
            this.errorMessage = 'Failed to delete category';
          }
        });
    }
  }

  saveCategory(): void {
    if (this.categoryForm.invalid) {
      Object.keys(this.categoryForm.controls).forEach(key => {
        this.categoryForm.get(key)?.markAsTouched();
      });
      return;
    }

    const formValue = this.categoryForm.value;
    this.isLoading = true;

    if (this.isEditing) {
      this.categoryService.updateCategory(this.editingId, formValue)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updatedCategory) => {
            const index = this.categories.findIndex(c => c.id === this.editingId);
            if (index !== -1) {
              this.categories[index] = updatedCategory;
            }
            this.closeModal();
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error updating category:', error);
            this.errorMessage = 'Failed to update category';
            this.isLoading = false;
          }
        });
    } else {
      this.categoryService.createCategory(formValue)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (newCategory) => {
            this.categories.push(newCategory);
            this.closeModal();
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error creating category:', error);
            this.errorMessage = 'Failed to create category';
            this.isLoading = false;
          }
        });
    }
  }

  getTotalSpent(): number {
    return this.categories.reduce((sum, cat) => sum + (cat.totalSpent || 0), 0);
  }

  retryLoading(): void {
    this.loadCategories();
  }
}