import { NgClass, NgIf } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
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
    MatIconModule,
    NgClass,
    NgIf,
  ],
  templateUrl: './layout.component.html',
})
export class LayoutComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
    private readonly activatedRoute = inject(ActivatedRoute);

  sidebarOpen = true;
  isSidebarOpen = false;
  isMobile = false;
  isDesktop = window.innerWidth >= 768;
  headerTitle = 'Coal Project';
  breadcrumbs: { label: string; url: string }[] = [];

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnInit() {
    this.isDesktop = window.innerWidth >= 768;
    this.sidebarOpen = this.isDesktop;
        this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.setBreadcrumbs();
      });
    this.setBreadcrumbs();
  }

  constructor() {
   
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.isDesktop = window.innerWidth >= 786;
    if (this.isDesktop) this.sidebarOpen = true;
    else {
      this.sidebarOpen = false;
    }
    this.updateViwe();
  }


  private updateViwe() {
    this.isMobile = window.innerWidth < 768;
  }
  private setBreadcrumbs() {
    this.breadcrumbs = this.buildBreadcrumbs(this.activatedRoute.root);
    if (this.breadcrumbs.length > 0) {
      this.headerTitle = this.breadcrumbs[this.breadcrumbs.length - 1].label;
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
      child.routeConfig?.path || '';

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
