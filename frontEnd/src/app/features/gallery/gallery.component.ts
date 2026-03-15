import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { GalleryService, GalleryItem } from '../../core/services/gallery.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="bg-white rounded-xl shadow-sm p-6">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Ma Galerie</h1>
        <a
          routerLink="/tryon"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
        >
          Nouvel essayage
        </a>
      </div>

      @if (loading) {
        <div class="text-center py-12">
          <div class="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p class="text-gray-500 mt-2">Chargement...</p>
        </div>
      } @else if (items.length > 0) {
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          @for (item of items; track item.id) {
            <div class="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition relative group">
              <!-- Image container with fixed height -->
              <div class="h-80 bg-gray-100 flex items-center justify-center p-1">
                <img
                  [src]="getImageUrl(item.resultImageUrl)"
                  alt="Essayage virtuel"
                  class="max-h-full max-w-full object-contain cursor-pointer"
                  (click)="openLightbox(item)"
                />
              </div>
              <!-- Delete button -->
              <button
                class="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow-md opacity-0 group-hover:opacity-100 hover:bg-red-600 transition"
                (click)="deleteItem($event, item.id)"
                title="Supprimer"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <!-- Info bar at bottom -->
              <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                <!-- Model name badge -->
                @if (item.modelName) {
                  <span
                    class="text-white text-xs px-2 py-0.5 rounded"
                    [class]="item.modelName.includes('IDM') ? 'bg-blue-600' : 'bg-purple-600'"
                  >
                    {{ item.modelName }}
                  </span>
                }
                <!-- Clothing button -->
                @if (item.clothing) {
                  <button
                    (click)="goToArticle(item.clothing.id); $event.stopPropagation()"
                    class="mt-1 w-full flex items-center gap-2 px-2 py-1 bg-white/90 rounded text-xs text-gray-800 hover:bg-white transition"
                  >
                    <img
                      [src]="getImageUrl(item.clothing.imageUrl)"
                      [alt]="item.clothing.name"
                      class="w-6 h-6 object-cover rounded"
                    />
                    <span class="truncate">{{ item.clothing.name }}</span>
                  </button>
                }
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="text-center py-12">
          <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p class="text-gray-500 mb-4">Aucun essayage sauvegardé</p>
          <a routerLink="/tryon" class="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Faire un essayage
          </a>
        </div>
      }
    </div>

    <!-- Lightbox -->
    @if (showLightbox && selectedItem) {
      <div
        class="fixed inset-0 bg-black bg-opacity-90 z-[100] flex items-center justify-center p-4"
        (click)="closeLightbox()"
      >
        <button
          class="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 transition"
          (click)="closeLightbox()"
        >
          &times;
        </button>
        <div class="relative" (click)="$event.stopPropagation()">
          <img
            [src]="getImageUrl(selectedItem.resultImageUrl)"
            alt="Essayage virtuel"
            class="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
          >
          @if (selectedItem.modelName) {
            <span
              class="absolute top-4 left-4 text-white text-sm px-3 py-1 rounded"
              [class]="selectedItem.modelName.includes('IDM') ? 'bg-blue-600' : 'bg-purple-600'"
            >
              {{ selectedItem.modelName }}
            </span>
          }
        </div>
      </div>
    }
  `
})
export class GalleryComponent implements OnInit {
  items: GalleryItem[] = [];
  loading = true;
  showLightbox = false;
  selectedItem: GalleryItem | null = null;

  constructor(
    private galleryService: GalleryService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadGallery();
  }

  loadGallery() {
    this.loading = true;
    this.galleryService.getMyGallery().subscribe({
      next: (data) => {
        this.items = data.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getImageUrl(url: string): string {
    if (!url) return 'assets/placeholder.png';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    const baseUrl = environment.apiUrl.replace('/api', '');
    return baseUrl + url;
  }

  deleteItem(event: Event, id: number) {
    event.stopPropagation();
    if (confirm('Supprimer cet essayage de votre galerie ?')) {
      this.galleryService.deleteFromGallery(id).subscribe({
        next: () => {
          this.items = this.items.filter(item => item.id !== id);
          this.cdr.detectChanges();
        }
      });
    }
  }

  openLightbox(item: GalleryItem) {
    this.selectedItem = item;
    this.showLightbox = true;
  }

  closeLightbox() {
    this.showLightbox = false;
    this.selectedItem = null;
  }

  goToArticle(clothingId: number) {
    this.router.navigate(['/article', clothingId]);
  }
}
