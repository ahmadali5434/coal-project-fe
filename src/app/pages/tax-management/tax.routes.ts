import { Routes } from '@angular/router';

export const TAXROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./tax-management.component').then((m) => m.TaxComponent),
  },
  {
    path: 'taxes',
    loadComponent: () =>
      import('./taxes-detail/taxes-detail').then((m) => m.TaxesDetail),
    data: { breadcrumb: 'Taxes' },
  },
  {
    path: 'tax-rules',
    loadComponent: () =>
      import('./tax-rules/tax-rules.component').then((m) => m.TaxRulesComponent),
    data: { breadcrumb: 'Taxes' },
  },
  {
    path: 'tax-dependencies',
    loadComponent: () =>
      import('./tax-dependencies/tax-dependencies.component').then((m) => m.TaxDependenciesComponent),
    data: { breadcrumb: 'Taxes' },
  },
];
