import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Overlay mobile -->
    @if (isOpen) {
      <div
        class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        (click)="closeSidebar.emit()"
      ></div>
    }

    <!-- Sidebar -->
    <aside
      class="fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 bg-gray-800 text-white transform transition-transform duration-300 lg:translate-x-0"
      [class.translate-x-0]="isOpen"
      [class.-translate-x-full]="!isOpen"
    >
      <nav class="p-4 space-y-2">
        <a
          routerLink="/admin"
          routerLinkActive="bg-gray-700"
          [routerLinkActiveOptions]="{exact: true}"
          class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition"
          (click)="closeSidebar.emit()"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>Dashboard</span>
        </a>

        <a
          routerLink="/admin/articles"
          routerLinkActive="bg-gray-700"
          class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition"
          (click)="closeSidebar.emit()"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span>Articles</span>
        </a>

        <a
          routerLink="/admin/commandes"
          routerLinkActive="bg-gray-700"
          class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition"
          (click)="closeSidebar.emit()"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span>Commandes</span>
        </a>
      </nav>
    </aside>
  `
})
export class AdminSidebarComponent {
  @Input() isOpen = false;
  @Output() closeSidebar = new EventEmitter<void>();
}
