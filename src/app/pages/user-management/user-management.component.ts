import { Component, inject } from '@angular/core';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-user-management',
  imports: [MatIcon, MatIconModule, RouterLink , RouterOutlet],
  templateUrl: './user-management.component.html',

})
export class UserManagementComponent {
  private readonly authService = inject(AuthService);
  isAdmin = false;

  ngOnInit() {
    const user = this.authService.currentUser;
    this.isAdmin = !!(user && user.role === 'admin');
    this.isAdmin = true; // Remove or modify this line in production
  }

}
