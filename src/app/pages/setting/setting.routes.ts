import { Routes } from "@angular/router";

export const SETTINGROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./setting.component').then((m) => m.SettingComponent),
  },
  { 
    path: 'roles/create',
    loadComponent: () =>
      import('./role-permission/role-form.component').then(
        (m) => m.RoleFormComponent
      ),
  },
  {
    path: 'roles/edit/:id',
    loadComponent: () =>
      import('./role-permission/role-form.component').then(
        (m) => m.RoleFormComponent
      ),
  },
  // Uncomment when your component is ready
  // {
  //   path: 'countries-cities',
  //   loadComponent: () =>
  //     import('./country-city-table/country-city-table.component').then(
  //       (m) => m.CountryCityTableComponent
  //     ),
  // },
];
