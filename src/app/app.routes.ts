import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { AuthGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadChildren: () =>
      import('./pages/login/login.routes').then((m) => m.authRoutes),
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard], // Protects all child routes
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./pages/home/home.component').then((m) => m.HomeComponent),
        data: { breadcrumb: 'Home' }
      },
      {
        path: 'buy-stock-form',
        loadChildren: () =>
          import('./pages/buy-stock/buy-stock.routes').then(
            (m) => m.BUYSTOCKROUTES
          ),
        data: { breadcrumb: 'Buy Stock' },
      },
      {
        path: 'stocks',
        loadComponent: () =>
          import('./pages/warehouse/warehouse.component').then(
            (m) => m.WarehouseComponent
          ),
            data: { breadcrumb: 'Warehouses' }
      },
      {
        path: 'transfer',
        loadComponent: () =>
          import('./pages/transfer/transfer.component').then(
            (m) => m.TransferComponent
          ),
            data: { breadcrumb: 'Transfer' },
      },
      {
        path: 'expenses',
        loadComponent: () =>
          import('./pages/expenses/expenses.component').then(
            (m) => m.ExpensesComponent
          ),
          data: { breadcrumb: 'Expenses' }
      },
      {
        path: 'setting',
        loadChildren: () =>
          import('./pages/setting/setting.routes').then(
            (m) => m.SETTINGROUTES
          ),
           data: { breadcrumb: 'Settings' }
      },
      {
        path: 'user-mang',
        loadChildren: () =>
          import('./pages/user-management/user-management.routes').then(
            (m) => m.USERMANAGEMENTROUTES
          ),
          data: { breadcrumb: 'User Management' },
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: '404',
        loadComponent: () =>
          import('./pages/no-page-found/no-page-found.component').then(
            (m) => m.NoPageFoundComponent
          ),
          data: { breadcrumb: 'Not Found' },
      },
      
      { path: '**', redirectTo: '/404' }, // fallback
    ],
  },
];
