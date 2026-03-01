import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatIconModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  registerForm!: FormGroup;
  isLoading = false;
  showPassword = false;  
  showConfirmPassword = false; 

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  get fullName() { return this.registerForm.get('fullName'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }

  togglePasswordVisibility() { this.showPassword = !this.showPassword; }
  toggleConfirmPasswordVisibility() { this.showConfirmPassword = !this.showConfirmPassword; }

  onSubmit(): void {
    this.registerForm.markAllAsTouched();

    if (this.registerForm.invalid || this.password?.value !== this.confirmPassword?.value) {
      if (this.password?.value !== this.confirmPassword?.value) {
        this.showMessage('Passwords do not match', true);
      }
      return;
    }

    this.isLoading = true;

    this.authService.register(this.registerForm.value).subscribe({
    next: (response) => {
      if (response.success) {
        this.showMessage('Account created successfully! Please login', false);
        setTimeout(() => this.router.navigate(['/login']), 1500);
      }
    },
    error: (err) => {
      this.isLoading = false;
      this.showMessage(err.error?.message || 'Registration failed. Please try again.', true);
    },
    complete: () => this.isLoading = false
  });
}

  private showMessage(message: string, isError: boolean): void {
    this.snackBar.open(message, 'Close', {
      duration: isError ? 5000 : 3000,
      panelClass: [isError ? 'error-snackbar' : 'success-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}