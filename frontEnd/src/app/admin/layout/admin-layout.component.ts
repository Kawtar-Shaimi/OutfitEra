import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminHeaderComponent } from './admin-header.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminHeaderComponent],
  template: `
    <div class="min-h-screen bg-gray-100">
      <app-admin-header />

      <main class="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        <router-outlet />
      </main>
    </div>
  `
})
export class AdminLayoutComponent {}
