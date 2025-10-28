import { Component, HostListener, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Router,
  NavigationEnd,
  RouterModule,
  RouterLink,
  RouterOutlet,
  ActivatedRoute,
} from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../auth/auth.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterLink,
    RouterOutlet,
    MatIconModule,
    CommonModule,
    RouterModule,
  ],
  templateUrl: './layout.component.html',
})
export class LayoutComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly activatedRoute = inject(ActivatedRoute);

  sidebarExpanded = true;
  isDesktop = window.innerWidth >= 1024;
  headerTitle = 'Coal Project';
  breadcrumbs: { label: string; url: string }[] = [];

  ngOnInit() {
    this.updateLayoutState();
  
    const savedSidebarState = localStorage.getItem('sidebarExpanded');
    if (savedSidebarState !== null) {
      this.sidebarExpanded = savedSidebarState === 'true';
    }
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => 
        this.setBreadcrumbs());
    this.setBreadcrumbs();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleSidebarExpand() {
    if (!this.isDesktop) return;
    this.sidebarExpanded = !this.sidebarExpanded;
    localStorage.setItem('sidebarExpanded', this.sidebarExpanded.toString());
  }

  @HostListener('window:resize')
  onResize() {
    this.updateLayoutState();
  }
private updateLayoutState(){
  this.isDesktop = window.innerWidth >= 1024;
  if (!this.isDesktop) {
    this.sidebarExpanded = false;
  }
}

  private setBreadcrumbs() {
    this.breadcrumbs = this.buildBreadcrumbs(this.activatedRoute.root);
    if (this.breadcrumbs.length > 0) {
      this.headerTitle = this.breadcrumbs[this.breadcrumbs.length - 1].label;
    } else {
      this.headerTitle = 'Coal Project';
    }
  }

  private buildBreadcrumbs(
    route: ActivatedRoute,
    url: string = '',
    breadcrumbs: { label: string; url: string }[] = []
  ): { label: string; url: string }[] {
    const children = route.children;

    for (const child of children) {
      const routeURL: string =
        child.snapshot.url.map((segment) => segment.path).join('/') ||
        child.routeConfig?.path ||
        '';

      if (routeURL !== '') {
        url += `/${routeURL}`;
      }

      if (child.snapshot.data['breadcrumb']) {
        const label = child.snapshot.data['breadcrumb'];
        if (!breadcrumbs.some((bc) => bc.label === label)) {
          breadcrumbs.push({ label, url });
        }
      }

      this.buildBreadcrumbs(child, url, breadcrumbs);
    }

    return breadcrumbs;
  }
}
