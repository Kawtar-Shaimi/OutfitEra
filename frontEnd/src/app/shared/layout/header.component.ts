import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
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
          <a routerLink="/" class="flex items-center gap-2">
            <span class="text-2xl font-bold text-blue-600">Outfitera</span>
          </a>
        </div>

        <!-- Center: Search bar -->
        <div class="hidden md:flex flex-1 max-w-xl mx-8">
          <div class="relative w-full">
            <input
              type="text"
              placeholder="Rechercher des vetements..."
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
            routerLink="/catalog"
            routerLinkActive="bg-blue-50 text-blue-600"
            class="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            Articles
          </a>
          <a
            routerLink="/tryon"
            routerLinkActive="bg-blue-50 text-blue-600"
            class="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            Essayage Virtuel
          </a>
          <a
            routerLink="/gallery"
            routerLinkActive="bg-blue-50 text-blue-600"
            class="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            Ma Galerie
          </a>
          <a
            routerLink="/favorites"
            routerLinkActive="bg-blue-50 text-blue-600"
            class="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            Mes Favoris
          </a>
          <a
            routerLink="/orders"
            routerLinkActive="bg-blue-50 text-blue-600"
            class="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            Mes Commandes
          </a>
        </nav>

        <!-- Right: Icons -->
        <div class="flex items-center gap-2">
          <!-- Notifications -->
          <button class="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            @if (notificationCount > 0) {
              <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            }
          </button>

          <!-- Cart -->
          <button class="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            @if (cartCount > 0) {
              <span class="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {{ cartCount }}
              </span>
            }
          </button>

          <!-- Profile -->
          <button class="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>

          <!-- Login button -->
          <a
            routerLink="/login"
            class="hidden sm:block ml-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
          >
            Connexion
          </a>
        </div>
      </div>

      <!-- Mobile navigation (shown when logged in) -->
      <div class="lg:hidden border-t border-gray-200 px-4 py-2 flex gap-2 overflow-x-auto">
        <a
          routerLink="/catalog"
          routerLinkActive="bg-blue-50 text-blue-600"
          class="flex-shrink-0 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          Articles
        </a>
        <a
          routerLink="/tryon"
          routerLinkActive="bg-blue-50 text-blue-600"
          class="flex-shrink-0 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          Essayage
        </a>
        <a
          routerLink="/gallery"
          routerLinkActive="bg-blue-50 text-blue-600"
          class="flex-shrink-0 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          Galerie
        </a>
        <a
          routerLink="/favorites"
          routerLinkActive="bg-blue-50 text-blue-600"
          class="flex-shrink-0 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          Favoris
        </a>
        <a
          routerLink="/orders"
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
export class HeaderComponent {
  @Input() sidebarOpen = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  notificationCount = 0;
  cartCount = 0;
}
