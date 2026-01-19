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
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { ExchangeRateDialogComponent } from '../pages/exchange-rate/exchange-rate-dialog/exchange-rate-dialog.component';
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
    MatDialogModule,
    NgClass,
    NgIf,
  ],
  templateUrl: './layout.component.html',
})
export class LayoutComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);

  sidebarOpen = true;
  isSidebarOpen = false;
  isMobile = false;
  isDesktop = window.innerWidth >= 768;
  headerTitle = 'Coal Project';
  breadcrumbs: { label: string; url: string }[] = [];
userName: string | null = null;
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnInit() {
    this.isDesktop = window.innerWidth >= 768;
    this.sidebarOpen = this.isDesktop;
    this.userName = this.authService.getUserName();
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.setBreadcrumbs();
      });
    this.setBreadcrumbs();
  }

  constructor() {}

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  openExchangeDialog(exchangeRate?: any): void {
    this.dialog.open(ExchangeRateDialogComponent, {
      width: '800px',
      data: { exchangeRate },
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
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
  getInitials(name: string | null | undefined): string {
  if (!name) return '';

  const words = name.trim().split(/\s+/);

  if (words.length >= 2) {
    return (
      words[0].charAt(0).toUpperCase() +
      words[1].charAt(0).toUpperCase()
    );
  }

  const single = words[0];
  if (single.length === 1) {
    return single.charAt(0).toUpperCase();
  }

  return (
    single.charAt(0).toUpperCase() +
    single.charAt(single.length - 1).toUpperCase()
  );
}

}
