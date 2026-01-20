import { Routes } from '@angular/router';

export const TAXRMANAGEMENTROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./tax-management.component').then(
        (m) => m.TaxManagementComponent
      ),
  
  },
{
  path: 'taxes',
  loadComponent: () =>
    import('./taxes.component/taxes.component').then(
      (m) => m.TaxesComponent
    ),
  data: { breadcrumb: 'Taxes' },
}
];
