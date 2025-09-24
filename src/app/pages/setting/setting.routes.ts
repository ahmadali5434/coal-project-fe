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
       data: { breadcrumb: 'Create Role' },
  },
  {
    path: 'roles/edit/:id',
    loadComponent: () =>
      import('./role-permission/role-form.component').then(
        (m) => m.RoleFormComponent
      ),
      data: { breadcrumb: 'Edit Role' },
  },

  {
    path: 'countries-cities',
    loadComponent: () =>
      import('./country-city-table.component/country-city-table.component').then(
        (m) => m.CountryCityTableComponent
      ),
         data: { breadcrumb: 'Countries & Cities' },
  },
];
