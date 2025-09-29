import { Component, inject } from '@angular/core';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { HasPermissionDirective } from '../../core/directives/has-permission.directive';

@Component({
  selector: 'app-user-management',
  imports: [
    MatIcon, 
    MatIconModule, 
    RouterLink, 
    RouterOutlet,
    HasPermissionDirective,
  ],
  templateUrl: './user-management.component.html',

})
export class UserManagementComponent {
  
}
