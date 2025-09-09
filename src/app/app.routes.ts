import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';


export const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.routes')
      .then(m => m.authRoutes),
  },
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./pages/home/home.component').then((m) => m.HomeComponent),
      },

      {
        path: 'buy-stock-form',
        loadChildren: () =>
          import('./pages/buy-stock/buy-stock.routes').then((m) => m.BUYSTOCKROUTES),
      },
      {
        path: 'stocks',
        loadComponent: () =>
          import('./pages/warehouse/warehouse.component').then((m) => m.WarehouseComponent),
      },
      {
        path: 'transfer',
        loadComponent: () =>
          import('./pages/transfer/transfer.component').then(
            (m) => m.TransferComponent
          ),
      },
      {
        path: 'expenses',
        loadComponent: () =>
          import('./pages/expenses/expenses.component').then(
            (m) => m.ExpensesComponent
          ),
      },
      {
        path: 'Setting',
        loadComponent: () =>
          import('./pages/setting/setting.component').then(
            (m) => m.SettingComponent
        ),  },
      {
  path: 'user-mang',
        loadChildren: () =>
          import('./pages/user-management/user-management.routes').then(
            (m) => m.USERMANAGEMENTROUTES
          ),
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
      },
      // { path: '**', redirectTo: '/404', pathMatch: 'full' },
    ],
  },
];
