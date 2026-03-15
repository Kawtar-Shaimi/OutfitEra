import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './header.component';
import { SidebarComponent } from './sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, SidebarComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <app-header
        [sidebarOpen]="sidebarOpen"
        (toggleSidebar)="sidebarOpen = !sidebarOpen"
      />

      <div class="flex">
        <!-- Sidebar -->
        <app-sidebar
          [isOpen]="sidebarOpen"
          (closeSidebar)="sidebarOpen = false"
        />

        <!-- Main Content -->
        <main class="flex-1 lg:ml-64">
          <div class="p-4 lg:p-6">
            <router-outlet />
          </div>
        </main>
      </div>
    </div>
  `
})
export class MainLayoutComponent {
  sidebarOpen = false;
}
