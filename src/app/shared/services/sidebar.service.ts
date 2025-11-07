import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  isCollapsed = signal(false);
  isMobileOpen = signal(false);

  toggleCollapse() {
    this.isCollapsed.set(!this.isCollapsed());
  }

  toggleMobile() {
    this.isMobileOpen.set(!this.isMobileOpen());
  }

  closeMobile() {
    this.isMobileOpen.set(false);
  }

  getSidebarWidth(): string {
    if (this.isCollapsed()) {
      return '5rem'; // 20 en Tailwind (w-20)
    }
    return '16rem'; // 64 en Tailwind (w-64)
  }
}
