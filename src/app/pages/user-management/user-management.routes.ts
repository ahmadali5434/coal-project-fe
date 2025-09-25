import { Routes } from '@angular/router';

export const USERMANAGEMENTROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./user-management.component').then(
        (m) => m.UserManagementComponent
      ),
  
  },
{
  path: 'cdetails',
  loadComponent: () =>
    import('../customerDetails/customerDetails.component').then(
      (m) => m.CdetailsComponent
    ),
      data: { breadcrumb: 'Customers' },
}
,
  {
    path: 'dirvers',
    loadComponent: () =>
      import('../dirver-details/dirver-details.component').then(
        (m) => m.DirverDetailsComponent
      ),
      data: { breadcrumb: 'Drivers' }, 
  },
   {
    path: 'add-user',
    loadComponent: () =>
      import('../add-user/add-user.component').then(
        (m) => m.AddUserComponent  
      ),
        data: { breadcrumb: 'Create User' },
  },

];
