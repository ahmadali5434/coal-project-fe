import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  Validators,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './add-user.component.html',
})
export class AddUser {
  form: FormGroup;
  hidePasswordField = true;
  hideConfirmPasswordField = true;
  private readonly authService = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group(
      {
        username: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordsMatchValidator }
    );
  }
  passwordsMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordsMismatch: true };
  }
  hidePassword() {
    return this.hidePasswordField;
  }
  hideConfirmPassword() {
    return this.hideConfirmPasswordField;
  }
  togglePasswordVisibility(field: 'password' | 'confirmPassword') {
    if (field === 'password') {
      this.hidePasswordField = !this.hidePasswordField;
    } else {
      this.hideConfirmPasswordField = !this.hideConfirmPasswordField;
    }
  }
  onAddUser() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { username, password } = this.form.value;
    this.authService.register(username, password).subscribe({
      next: () => {
        this.snackBar.open(
          'Registration successful! Please log in.',
          'Close',
          { duration: 3000 }
        );
        this.authService.login(username, password).subscribe({
          next: () => {
            this.snackBar.open('Logged in successfully!', 'Close', {
              duration: 2000,
            });
          },
          error: (err) => {
            this.snackBar.open(
              err.error?.error || 'Login failed after signup.',
              'Close',
              { duration: 3000 }
            );
          },
        });
        this.router.navigate(['/login']);
      },

      error: (err) => {
        if (err.status !== 409) {
          this.snackBar.open(
            err.error?.error || 'Registration failed. Try again.',
            'Close',
            { duration: 3000 }
          );
        }
      },
    });
  }
}