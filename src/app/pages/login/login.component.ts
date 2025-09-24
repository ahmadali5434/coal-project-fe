import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { merge } from 'rxjs';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Auth
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSnackBarModule,
    FormsModule,
    ReactiveFormsModule,
    RouterOutlet,
  ],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  readonly username = new FormControl('', [Validators.required]);
  readonly password = new FormControl('', [Validators.required]);

  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);

  errorMessage = signal('');
  hide = signal(true);

  constructor() {
    merge(this.username.statusChanges, this.username.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updateErrorMessage());
  }

  updateErrorMessage() {
    if (this.username.hasError('required')) {
      this.errorMessage.set('You must enter a value');
    } else if (this.username.hasError('username')) {
    } else {
      this.errorMessage.set('');
    }
  }

  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  onLoginClicked() {
    if (this.username.invalid || this.password.invalid) {
      this.snackBar.open('Please enter valid credentials', 'Close', {
        duration: 3000,
      });
      return;
    }
    this.authService.login(this.username.value!, this.password.value!).subscribe({
      next: () => {
        this.snackBar.open('Login successful!', 'Close', { duration: 2000 });
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.snackBar.open(
          err.error?.error || 'Login failed. Try again.',
          'Close',
          { duration: 3000 }
        );
      },
    });
  }

  onForgotPasswordClicked() {
    this.router.navigate(['/login/forgot-password']);
  }
}
