import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Category {
  name: string;
  route: string;
}

interface CatalogSection {
  title: string;
  icon: string;
  categories: Category[];
  expanded: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Overlay for mobile -->
    @if (isOpen) {
      <div
        class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        (click)="closeSidebar.emit()"
      ></div>
    }

    <!-- Sidebar -->
    <aside
      class="fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 lg:translate-x-0 lg:top-16 lg:z-30"
      [class.translate-x-0]="isOpen"
      [class.-translate-x-full]="!isOpen"
    >
      <!-- Mobile close button -->
      <div class="lg:hidden flex items-center justify-between p-4 border-b">
        <span class="text-lg font-semibold text-gray-800">Catalogue</span>
        <button (click)="closeSidebar.emit()" class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Sidebar content -->
      <div class="p-4 overflow-y-auto h-full pb-20">
        <h2 class="hidden lg:block text-lg font-semibold text-gray-800 mb-4">Catalogue</h2>

        @for (section of catalog; track section.title) {
          <div class="mb-4">
            <!-- Section header -->
            <button
              (click)="section.expanded = !section.expanded"
              class="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
            >
              <span class="font-medium text-gray-800">{{ section.title }}</span>
              <svg
                class="w-5 h-5 text-gray-500 transition-transform"
                [class.rotate-180]="section.expanded"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- Categories -->
            @if (section.expanded) {
              <div class="mt-2 ml-4 space-y-1">
                @for (cat of section.categories; track cat.route) {
                  <a
                    [routerLink]="cat.route"
                    routerLinkActive="bg-blue-50 text-blue-600 border-l-2 border-blue-600"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-r-lg transition"
                    (click)="closeSidebar.emit()"
                  >
                    {{ cat.name }}
                  </a>
                }
              </div>
            }
          </div>
        }
      </div>
    </aside>
  `
})
export class SidebarComponent {
  @Input() isOpen = false;
  @Output() closeSidebar = new EventEmitter<void>();

  catalog: CatalogSection[] = [
    {
      title: 'Femme',
      icon: '',
      expanded: true,
      categories: [
        { name: 'Hauts', route: '/catalog/FEMME/TOP' },
        { name: 'Pantalons', route: '/catalog/FEMME/BOTTOM' },
        { name: 'Robes', route: '/catalog/FEMME/DRESS' }
      ]
    },
    {
      title: 'Homme',
      icon: '',
      expanded: true,
      categories: [
        { name: 'Hauts', route: '/catalog/HOMME/TOP' },
        { name: 'Pantalons', route: '/catalog/HOMME/BOTTOM' }
      ]
    }
  ];
}
