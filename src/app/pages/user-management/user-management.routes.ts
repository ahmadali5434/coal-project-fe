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
}
,
  {
    path: 'dirvers',
    loadComponent: () =>
      import('../dirver-details/dirver-details.component').then(
        (m) => m.DirverDetailsComponent
      ),
  },
   {
    path: 'add-user',
    loadComponent: () =>
      import('../signup/signup.component').then(
        (m) => m.SignupComponent  
      ),
  },

];
