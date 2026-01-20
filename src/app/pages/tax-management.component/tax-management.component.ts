import { Component,  } from '@angular/core';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterOutlet } from '@angular/router';
import { HasPermissionDirective } from '../../core/directives/has-permission.directive';

@Component({
  selector: 'app-tax-management',
  imports: [
    MatIcon, 
    MatIconModule, 
    RouterLink, 
    RouterOutlet,
    HasPermissionDirective,
  ],
  templateUrl: './tax-management.component.html',

})
export class TaxManagementComponent {
  
}
