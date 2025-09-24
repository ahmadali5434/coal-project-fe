import { Routes } from '@angular/router';

export const BUYSTOCKROUTES: Routes = [
  {
    path: '',
       data: { breadcrumb: 'Buy Stock' },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./buy-stock.component').then(
            (m) => m.BuyStockComponent
          ),
             data: { breadcrumb: 'Buy Stock' }
      
      },
      {
        path: 'custom',
        loadComponent: () =>
          import('./custom-dialog/custom-dialog.component').then(
            (m) => m.CustomDialogComponent
          ),
            data: { breadcrumb: 'Custom Dialog' },
      },
    ],
  },
];
