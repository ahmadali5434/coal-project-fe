import { Component } from '@angular/core';
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-setting',
  imports: [MatCardModule, MatIconModule, RouterLink, RouterModule],
  templateUrl: './setting.component.html',

})
export class SettingComponent {

}
