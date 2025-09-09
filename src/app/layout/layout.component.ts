import { NgClass, NgIf } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterLink,
    RouterOutlet,
    MatIconModule ,
    CommonModule,
    RouterModule,
    MatIconModule,
    NgClass ,
    NgIf
  ],
  templateUrl: './layout.component.html',
})
export class LayoutComponent {
  private readonly router = inject(Router);

  sidebarOpen = true;
  isSidebarOpen = false;
  isMobile = false;
   isDesktop = window.innerWidth >= 768; 
  headerTitle = 'Coal Project';


  logout() {
    this.router.navigate(['/login']);
  }
 ngOnInit() {
  this.isDesktop  = window.innerWidth >= 768; 
    this.sidebarOpen = this.isDesktop; 
  }
  constructor(){
    this.router.events
    .subscribe (() => {
      this.updateHeaderTitale(this.router.url);
      if (!this.isDesktop) this.sidebarOpen = false
      this.updateViwe();
    })
  }
  toggleSidebar(){
    this.sidebarOpen = !this.sidebarOpen;
  }
  @HostListener('window:resize' , ['$event'])
  onResize(){
    this.isDesktop = window.innerWidth >= 786;
    if (this.isDesktop) this.sidebarOpen = true;
    else {
      this.sidebarOpen = false; 
    }
    this.updateViwe();
  }
  updateHeaderTitale(url:string): void{
    const routesMap: {[key:string]: string} ={
      '/home': 'Home',
      '/stocks': 'Warehouses',
      '/transfer': 'Transfer',
      '/expenses': 'Expenses',
      '/cdetails': 'Customer Details',
      '/Setting' : 'Settings',
      '/user-mang' : 'User Management',
      '/dirvers' : 'Dirver Details'
    }
        const matched = Object.keys(routesMap).find(key => url.startsWith(key));
    this.headerTitle = matched ? routesMap[matched] : 'Coal Project';
  }
  private updateViwe(){
    this.isMobile = window.innerWidth <768;
 
  }
}
