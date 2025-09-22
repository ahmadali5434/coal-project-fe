import { Component } from '@angular/core';
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
export class SignupComponent {
  form: FormGroup;
  hidePasswordField = true;
  hideConfirmPasswordField = true;
  constructor(private fb: FormBuilder) {
    this.form = this.fb.group(
      {
        name: ['', Validators.required],
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
    console.log('User created:', this.form.value);
  }
}