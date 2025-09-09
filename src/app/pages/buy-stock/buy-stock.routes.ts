import { Routes } from '@angular/router';

export const BUYSTOCKROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./buy-stock.component').then(
            (m) => m.BuyStockComponent
          ),
      },
      {
        path: 'custom',
        loadComponent: () =>
          import('./custom-dialog/custom-dialog.component').then(
            (m) => m.CustomDialogComponent
          ),
      },
    ],
  },
];
