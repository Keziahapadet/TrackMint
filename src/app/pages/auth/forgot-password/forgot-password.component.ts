import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatIconModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements OnInit {
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  forgotPasswordForm!: FormGroup;
  isLoading = false;
  emailSent = false;
  submittedEmail = '';

  ngOnInit(): void {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get email() { return this.forgotPasswordForm.get('email'); }

  isFieldInvalid(field: string): boolean {
    const control = this.forgotPasswordForm.get(field);
    return !!(control?.invalid && (control?.dirty || control?.touched));
  }

  getEmailErrorMessage(): string {
    if (this.email?.hasError('required')) return 'Email is required';
    if (this.email?.hasError('email')) return 'Please enter a valid email address';
    return '';
  }

  onSubmit(): void {
    this.forgotPasswordForm.markAllAsTouched();

    if (this.forgotPasswordForm.invalid) {
      this.showMessage('Please enter a valid email address', true);
      return;
    }

    this.isLoading = true;
  

    this.authService.forgotPassword(this.forgotPasswordForm.value).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.emailSent = true;
          this.showMessage('Password reset link sent to your email!', false);
        } else {
          
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.showMessage(err.error?.message || 'Failed to send reset link', true);
      }
    });
  }

  resendEmail(): void {
    this.emailSent = false;
    this.onSubmit();
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