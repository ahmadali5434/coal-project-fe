import { Component } from '@angular/core';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-user-management',
  imports: [MatIcon, MatIconModule, RouterLink , RouterOutlet],
  templateUrl: './user-management.component.html',

})
export class UserManagementComponent {

}
