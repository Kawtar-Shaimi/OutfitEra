import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { FavoritesService, Clothing } from '../../core/services/favorites.service';
import { removeFavorite } from '../../store/favorites/favorites.actions';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="bg-white rounded-xl shadow-sm p-6">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">Mes Favoris</h1>

      @if (loading) {
        <div class="text-center py-12">
          <div class="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p class="text-gray-500 mt-2">Chargement...</p>
        </div>
      } @else if (items.length > 0) {
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          @for (item of items; track item.id) {
            <div class="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition group">
              <div class="aspect-square bg-gray-100 relative overflow-hidden">
                <img
                  [src]="getImageUrl(item.imageUrl)"
                  [alt]="item.name"
                  class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <!-- Bouton supprimer des favoris -->
                <button
                  class="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition"
                  (click)="onRemoveFavorite($event, item.id)"
                  title="Retirer des favoris"
                >
                  <svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
                @if (item.stock === 0) {
                  <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span class="text-white font-medium">Rupture de stock</span>
                  </div>
                }
              </div>
              <div class="p-4">
                <h3 class="font-medium text-gray-800 truncate">{{ item.name }}</h3>
                <p class="text-sm text-gray-500 mt-1">Tailles: {{ item.availableSizes?.join(', ') || 'N/A' }}</p>
                <div class="flex items-center justify-between mt-2">
                  <span class="text-lg font-bold text-blue-600">{{ item.price }} DH</span>
                </div>
                <button class="mt-3 block w-full text-center py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">
                  Commander
                </button>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="text-center py-12">
          <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <p class="text-gray-500 mb-4">Aucun favori</p>
          <a routerLink="/catalog" class="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Découvrir les articles
          </a>
        </div>
      }
    </div>
  `
})
export class FavoritesComponent implements OnInit {
  items: Clothing[] = [];
  loading = true;

  constructor(
    private favoritesService: FavoritesService,
    private store: Store,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadFavorites();
  }

  loadFavorites() {
    this.loading = true;
    this.favoritesService.getFavorites().subscribe({
      next: (data) => {
        this.items = data;
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
    if (url.startsWith('http')) return url;
    const baseUrl = environment.apiUrl.replace('/api', '');
    return baseUrl + url;
  }

  onRemoveFavorite(event: Event, itemId: number) {
    event.stopPropagation();
    this.store.dispatch(removeFavorite({ clothingId: itemId }));
    this.items = this.items.filter(item => item.id !== itemId);
    this.cdr.detectChanges();
  }
}
