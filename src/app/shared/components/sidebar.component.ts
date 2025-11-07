import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SidebarService } from '../services/sidebar.service';
import { AuthService } from '../../core/services/auth.service';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  color: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  private readonly authService = inject(AuthService);
  userEmail: string = '';
  filteredMenuItems: MenuItem[] = [];

  private readonly allMenuItems: MenuItem[] = [
    {
      label: 'Bienvenida',
      icon: 'pi-home',
      route: '/welcome',
      color: ''
    },
    {
      label: 'Tipos de Cambio',
      icon: 'pi-table',
      route: '/exchange-rates',
      color: ''
    },
    {
      label: 'Parámetros',
      icon: 'pi-sliders-h',
      route: '/parameters',
      color: ''
    },
    {
      label: 'Configuración',
      icon: 'pi-cog',
      route: '/configuration',
      color: ''
    }
  ];

  constructor(
    private router: Router,
    public sidebarService: SidebarService
  ) {}

  ngOnInit(): void {
    this.userEmail = this.authService.getUserEmail() || 'Usuario';
    this.filterMenuByRole();
  }

  private filterMenuByRole(): void {
    const canEdit = this.authService.canEdit();
    this.filteredMenuItems = this.allMenuItems.filter(item => {
      if (item.route === '/parameters' && !canEdit) {
        return false;
      }
      return true;
    });
  }

  onMenuItemClick() {
    if (window.innerWidth < 1024) {
      this.sidebarService.closeMobile();
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
