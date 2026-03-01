import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatIconModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent implements OnInit {
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  resetPasswordForm!: FormGroup;
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;
  tokenValid = true;
  passwordReset = false;
  resetToken = '';

  ngOnInit(): void {
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d)/)]],
      confirmPassword: ['', Validators.required]
    });

    this.route.queryParams.subscribe(params => {
      this.resetToken = params['token'] || '';
      if (!this.resetToken) {
        this.tokenValid = false;
        this.showMessage('Invalid or missing reset token', true);
      } else {
        this.authService.validateResetToken(this.resetToken).subscribe({
          next: (res) => this.tokenValid = res.success,
          error: () => {
            this.tokenValid = false;
            this.showMessage('Invalid or expired reset token', true);
          }
        });
      }
    });
  }

  get password() { return this.resetPasswordForm.get('password'); }
  get confirmPassword() { return this.resetPasswordForm.get('confirmPassword'); }
  get hasMinLength() { return this.password?.value?.length >= 8; }
  get hasUppercase() { return /[A-Z]/.test(this.password?.value || ''); }
  get hasNumber() { return /\d/.test(this.password?.value || ''); }

  togglePasswordVisibility() { this.showPassword = !this.showPassword; }
  toggleConfirmPasswordVisibility() { this.showConfirmPassword = !this.showConfirmPassword; }

  isFieldInvalid(field: string): boolean {
    const control = this.resetPasswordForm.get(field);
    return !!(control?.invalid && (control?.dirty || control?.touched));
  }

  getPasswordErrorMessage(): string {
    if (this.password?.hasError('required')) return 'Password is required';
    if (this.password?.hasError('minlength')) return 'Password must be at least 8 characters';
    if (this.password?.hasError('pattern')) return 'Password must contain at least one uppercase letter and one number';
    return '';
  }

  getConfirmPasswordErrorMessage(): string {
    if (this.confirmPassword?.hasError('required')) return 'Please confirm your password';
    if (this.password?.value !== this.confirmPassword?.value) return 'Passwords do not match';
    return '';
  }

  onSubmit(): void {
    this.resetPasswordForm.markAllAsTouched();
    
    if (this.resetPasswordForm.invalid || this.password?.value !== this.confirmPassword?.value) {
      this.showMessage('Please fill all fields correctly', true);
      return;
    }

    this.isLoading = true;

    this.authService.resetPassword(
     this.resetPasswordForm.value
    ).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.passwordReset = true;
          this.showMessage('Password reset successfully!', false);
          setTimeout(() => this.router.navigate(['/login']), 3000);
        } else {
          
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.showMessage(err.error?.message || 'Failed to reset password', true);
      }
    });
  }

  backToLogin(): void {
    this.router.navigate(['/login']);
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