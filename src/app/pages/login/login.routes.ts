import { Routes } from '@angular/router';
import { LoginComponent } from './login.component';

export const authRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./login.component').then((m) => m.LoginComponent),
    children: [
      {
        path: 'forgotPassword',
        loadComponent: () =>
          import('./pages/forgot-password/forgot-password.component').then(
            (m) => m.ForgotPasswordComponent
          ),
      },
    ],
  },
];
