import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import { LoaderComponent } from './shared/loader/loader.component';
@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    LoaderComponent,
    MatButtonModule,
  
],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'coal';

}
