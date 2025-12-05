import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header {
  currentPageTitle = 'Dashboard';
  showUserMenu = false;

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updatePageTitle();
    });
  }

  updatePageTitle(): void {
    const currentUrl = this.router.url;

    if (currentUrl.includes('/inventario')) {
      this.currentPageTitle = 'Inventario';
    } else if (currentUrl.includes('/solicitudes')) {
      this.currentPageTitle = 'Solicitudes';
    } else {
      this.currentPageTitle = 'Dashboard';
    }
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  closeUserMenu(): void {
    this.showUserMenu = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const isUserMenuButton = target.closest('button[aria-label="User menu"]') !== null;
    const isInsideUserMenu = target.closest('.relative') !== null;

    if (!isUserMenuButton && !isInsideUserMenu) {
      this.closeUserMenu();
    }
  }
}
