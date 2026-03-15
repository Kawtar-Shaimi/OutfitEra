import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-40">
      <div class="flex items-center justify-between h-16 px-4">

        <!-- Left: Menu + Logo -->
        <div class="flex items-center gap-4">
          <!-- Mobile menu button -->
          <button
            (click)="toggleSidebar.emit()"
            class="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <!-- Logo -->
          <a routerLink="/admin" class="flex items-center">
            <span class="text-2xl font-bold text-blue-600">Outfitera</span>
          </a>
        </div>

        <!-- Center: Search bar -->
        <div class="hidden md:flex flex-1 max-w-xl mx-8">
          <div class="relative w-full">
            <input
              type="text"
              placeholder="Rechercher..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <!-- Navigation buttons -->
        <nav class="hidden lg:flex items-center gap-1">
          <a
            routerLink="/admin"
            routerLinkActive="bg-blue-50 text-blue-600"
            [routerLinkActiveOptions]="{exact: true}"
            class="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            Dashboard
          </a>
          <a
            routerLink="/admin/articles"
            routerLinkActive="bg-blue-50 text-blue-600"
            class="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            Articles
          </a>
          <a
            routerLink="/admin/commandes"
            routerLinkActive="bg-blue-50 text-blue-600"
            class="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            Commandes
          </a>
        </nav>

        <!-- Right: Icons -->
        <div class="flex items-center gap-2">
          <!-- Notifications -->
          <button class="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>

          <!-- Profile / Logout -->
          <button
            (click)="logout()"
            class="hidden sm:flex items-center gap-2 ml-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Deconnexion
          </button>
        </div>
      </div>

      <!-- Mobile navigation -->
      <div class="lg:hidden border-t border-gray-200 px-4 py-2 flex gap-2 overflow-x-auto">
        <a
          routerLink="/admin"
          routerLinkActive="bg-blue-50 text-blue-600"
          [routerLinkActiveOptions]="{exact: true}"
          class="flex-shrink-0 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          Dashboard
        </a>
        <a
          routerLink="/admin/articles"
          routerLinkActive="bg-blue-50 text-blue-600"
          class="flex-shrink-0 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          Articles
        </a>
        <a
          routerLink="/admin/commandes"
          routerLinkActive="bg-blue-50 text-blue-600"
          class="flex-shrink-0 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          Commandes
        </a>
      </div>
    </header>

    <!-- Spacer for fixed header -->
    <div class="h-16 lg:h-16"></div>
    <div class="lg:hidden h-12"></div>
  `
})
export class AdminHeaderComponent {
  @Input() sidebarOpen = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
