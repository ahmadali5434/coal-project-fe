import { Component, inject, OnInit } from '@angular/core';
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
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '../../auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { RoleService } from '../setting/role-permission/role.servicet';
import { Role } from '../setting/role-permission/role.model';
import { MatDialogActions } from "@angular/material/dialog";
import { MatDialogModule } from '@angular/material/dialog';
@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatDialogActions,
    MatDialogModule
  ],
  templateUrl: './add-user.component.html',
})
export class AddUserComponent implements OnInit {
  form: FormGroup;
  hidePasswordField = true;
  hideConfirmPasswordField = true;
  private readonly authService = inject(AuthService);
  private readonly roleService = inject(RoleService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  roles: Role[] = [];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group(
      {
        username: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
        role: ['user', Validators.required],
      },
      { validators: this.passwordsMatchValidator }
    );

    // ✅ Redirect non-admins
    // if (this.authService.currentUser?.role !== 'admin') {
    //   this.router.navigate(['/']);
    // }
  }
  ngOnInit(): void {
    this.roleService.getRoles().subscribe({
      next: (roles) => {
        console.log('Available roles:');
        roles.forEach((role) => {
          this.roles = roles;
        });
      },
      error: (err) => console.error('Error fetching roles:', err),
    });
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

    const { username, password, role } = this.form.value;

    this.authService.adminCreateUser(username, password, role).subscribe({
      next: () => {
        this.snackBar.open('User created successfully!', 'Close', {
          duration: 3000,
        });
        this.form.reset({ role: 'user' });
      },
      error: (err) => {
        this.snackBar.open(
          err.error?.error || 'Failed to create user',
          'Close',
          { duration: 3000 }
        );
      },
    });
  }
}
