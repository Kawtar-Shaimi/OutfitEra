import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { loadFavorites, toggleFavorite } from '../../store/favorites/favorites.actions';
import { selectFavoriteIds } from '../../store/favorites/favorites.selectors';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';

interface Clothing {
  id: number;
  name: string;
  description: string;
  category: string;
  gender: string;
  garmentType: string;
  price: number;
  stock: number;
  availableSizes: string[];
  imageUrl: string;
}

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="bg-white rounded-xl shadow-sm p-6">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">
        {{ getTitle() }}
      </h1>

      @if (loading) {
        <div class="text-center py-12">
          <div class="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p class="text-gray-500 mt-2">Chargement...</p>
        </div>
      } @else if (filteredItems.length > 0) {
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          @for (item of filteredItems; track item.id) {
            <div class="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition group">
              <div class="aspect-square bg-gray-100 relative overflow-hidden">
                <img
                  [src]="getImageUrl(item.imageUrl)"
                  [alt]="item.name"
                  class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <!-- Bouton favoris -->
                <button
                  class="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition"
                  (click)="onToggleFavorite($event, item.id)"
                >
                  @if (isFavorite(item.id)) {
                    <svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  } @else {
                    <svg class="w-5 h-5 text-gray-400 hover:text-red-500 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  }
                </button>
                @if (item.stock === 0) {
                  <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span class="text-white font-medium">Rupture de stock</span>
                  </div>
                }
              </div>
              <div class="p-4">
                <h3 class="font-medium text-gray-800 truncate">{{ item.name }}</h3>
                <p class="text-sm text-gray-500 mt-1">Tailles: {{ item.availableSizes.join(', ') || 'N/A' }}</p>
                <div class="flex items-center justify-between mt-2">
                  <span class="text-lg font-bold text-blue-600">{{ item.price }} DH</span>
                  <span class="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-1 rounded">
                    Stock: {{ item.stock }}
                  </span>
                </div>
                <div class="mt-3 flex gap-2">
                  <a
                    [routerLink]="['/article', item.id]"
                    class="flex-1 text-center py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition text-sm font-medium"
                  >
                    Aperçu
                  </a>
                  <button 
                    (click)="onOrder(item)"
                    [disabled]="addingItemIds.has(item.id)"
                    [class.bg-green-600]="addingItemIds.has(item.id)"
                    [class.hover:bg-green-700]="addingItemIds.has(item.id)"
                    class="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                    {{ addingItemIds.has(item.id) ? 'Ajouté !' : 'Commander' }}
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="text-center py-12">
          <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p class="text-gray-500">Aucun article disponible</p>
        </div>
      }
    </div>
  `
})
export class CatalogComponent implements OnInit {
  gender: string | null = null;
  category: string | null = null;
  items: Clothing[] = [];
  filteredItems: Clothing[] = [];
  loading = true;
  favoriteIds: number[] = [];
  addingItemIds: Set<number> = new Set<number>();
  addedItems: Set<number> = new Set<number>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private store: Store,
    private cartService: CartService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.store.dispatch(loadFavorites());

    this.store.select(selectFavoriteIds).subscribe(ids => {
      this.favoriteIds = ids;
      this.cdr.detectChanges();
    });

    this.route.paramMap.subscribe(params => {
      this.gender = params.get('gender');
      this.category = params.get('category');

      if (!this.gender || !this.category) {
        this.router.navigate(['/catalog/FEMME/TOP']);
        return;
      }

      if (this.items.length > 0) {
        this.filterItems();
      } else {
        this.loadItems();
      }
    });
  }

  loadItems() {
    const apiUrl = environment.apiUrl + '/clothing';
    this.http.get<Clothing[]>(apiUrl).subscribe({
      next: (data) => {
        this.items = data;
        this.filterItems();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  filterItems() {
    this.filteredItems = this.items.filter(item => {
      if (this.gender && item.gender.toUpperCase() !== this.gender.toUpperCase()) {
        return false;
      }
      if (this.category && item.category.toUpperCase() !== this.category.toUpperCase()) {
        return false;
      }
      return true;
    });
    this.loading = false;
    this.cdr.detectChanges();
  }

  getImageUrl(url: string): string {
    if (!url) return 'assets/placeholder.png';
    if (url.startsWith('http')) return url;
    const baseUrl = environment.apiUrl.replace('/api', '');
    return baseUrl + url;
  }

  getTitle(): string {
    let title = 'Catalogue';
    if (this.gender) {
      title = this.gender === 'FEMME' ? 'Femme' : 'Homme';
    }
    if (this.category) {
      title += ' - ' + this.getCategoryLabel(this.category);
    }
    return title;
  }

  getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      'TOP': 'Hauts',
      'BOTTOM': 'Pantalons',
      'DRESS': 'Robes'
    };
    return labels[category?.toUpperCase()] || category;
  }

  isFavorite(itemId: number): boolean {
    return this.favoriteIds.includes(itemId);
  }

  isAddedToCart(itemId: number): boolean {
    return this.addedItems.has(itemId);
  }

  onToggleFavorite(event: Event, itemId: number) {
    event.stopPropagation();
    this.store.dispatch(toggleFavorite({ clothingId: itemId }));
  }

  onOrder(item: Clothing) {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    // Feedback immédiat spécifique à cet article
    this.addingItemIds.add(item.id);
    this.cdr.detectChanges();

    const selectedSize = (item.availableSizes && item.availableSizes.length > 0) ? item.availableSizes[0] : 'M';
    
    this.cartService.addToCart(item.id, selectedSize, 1).subscribe({
      next: (updatedCart) => {
        console.log('Article ajouté avec succès', updatedCart);
        this.addedItems.add(item.id);
        
        if (item.stock > 0) {
          item.stock--;
        }

        this.cdr.detectChanges();
        // On recrée l'objet Set pour forcer la détection de changement Angular au cas où
        this.addingItemIds = new Set(this.addingItemIds);
        
        // Garder l'état "Ajouté !" pendant 60 secondes pour cet article (plus de temps pour la soutenance)
        setTimeout(() => {
          this.addingItemIds.delete(item.id);
          this.addingItemIds = new Set(this.addingItemIds);
          this.cdr.detectChanges();
        }, 60000);
      },
      error: (err) => {
        console.error('Erreur technique lors de l\'ajout au panier', err);
        this.addingItemIds.delete(item.id);
        this.cdr.detectChanges();
        
        const errorMsg = err.error?.error || 'Erreur inconnue';
        if (err.status === 401 || err.status === 403 || errorMsg.includes('authentifié')) {
          this.router.navigate(['/login']);
        }
      }
    });
  }
}
