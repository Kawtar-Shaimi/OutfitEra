import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { environment } from '../../../environments/environment';
import { toggleFavorite } from '../../store/favorites/favorites.actions';
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
  selector: 'app-article-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="bg-white rounded-xl shadow-sm p-6">
      <!-- Bouton retour -->
      <button
        (click)="goBack()"
        class="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Retour
      </button>

      @if (loading) {
        <div class="text-center py-12">
          <div class="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p class="text-gray-500 mt-2">Chargement...</p>
        </div>
      } @else if (article) {
        <div class="grid md:grid-cols-2 gap-8">
          <!-- Image -->
          <div class="relative">
            <div class="aspect-square bg-gray-100 rounded-xl overflow-hidden shadow-inner">
              <img
                [src]="getImageUrl(article.imageUrl)"
                [alt]="article.name"
                class="w-full h-full object-cover"
              />
            </div>
            <!-- Badge rupture de stock -->
            @if (article.stock === 0) {
              <div class="absolute top-4 left-4 px-4 py-1.5 bg-red-600 text-white text-sm font-bold rounded-full shadow-lg">
                Rupture de stock
              </div>
            }
            <!-- Bouton favori -->
            <button
              class="absolute top-4 right-4 p-3 bg-white rounded-full shadow-md hover:bg-gray-100 transition transform hover:scale-110"
              (click)="onToggleFavorite()"
            >
              @if (isFavorite) {
                <svg class="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              } @else {
                <svg class="w-6 h-6 text-gray-400 hover:text-red-500 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              }
            </button>
          </div>

          <!-- Informations -->
          <div class="flex flex-col">
            <!-- Catégorie et genre -->
            <div class="flex items-center gap-2 mb-3">
              <span class="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider rounded-full">
                {{ getGenderLabel(article.gender) }}
              </span>
              <span class="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider rounded-full">
                {{ getCategoryLabel(article.category) }}
              </span>
            </div>

            <!-- Nom -->
            <h1 class="text-3xl font-extrabold text-gray-900 mb-2">{{ article.name }}</h1>

            <!-- Prix -->
            <div class="flex items-baseline gap-2 mb-6">
              <span class="text-4xl font-black text-blue-600">{{ article.price }} DH</span>
              <span class="text-sm text-gray-400 font-medium">TVA incluse</span>
            </div>

            <!-- Description -->
            @if (article.description) {
              <div class="mb-8">
                <h3 class="text-sm font-bold text-gray-800 uppercase tracking-wide mb-3">Description</h3>
                <p class="text-gray-600 leading-relaxed">{{ article.description }}</p>
              </div>
            }

            <!-- Tailles disponibles -->
            <div class="mb-8">
              <div class="flex justify-between items-center mb-3">
                <h3 class="text-sm font-bold text-gray-800 uppercase tracking-wide">Tailles</h3>
                <span class="text-xs text-blue-600 hover:underline cursor-pointer font-medium">Guide des tailles</span>
              </div>
              @if (article.availableSizes && article.availableSizes.length > 0) {
                <div class="flex flex-wrap gap-3">
                  @for (size of article.availableSizes; track size) {
                    <button 
                      (click)="selectedSize = size"
                      [class.border-blue-600]="selectedSize === size"
                      [class.bg-blue-50]="selectedSize === size"
                      [class.text-blue-600]="selectedSize === size"
                      class="px-5 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:border-gray-400 transition"
                    >
                      {{ size }}
                    </button>
                  }
                </div>
              } @else {
                <p class="text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100 italic text-sm">Non spécifié</p>
              }
            </div>

            <!-- Stock -->
            <div class="mb-8 p-4 rounded-xl" [class.bg-green-50]="article.stock > 0" [class.bg-red-50]="article.stock === 0">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full" [class.bg-green-500]="article.stock > 0" [class.bg-red-500]="article.stock === 0"></div>
                <h3 class="text-sm font-bold" [class.text-green-800]="article.stock > 0" [class.text-red-800]="article.stock === 0">
                  {{ article.stock > 0 ? 'Disponible en stock' : 'Rupture de stock' }}
                </h3>
              </div>
              @if (article.stock > 0) {
                <p class="text-sm font-medium mt-1" [class.text-green-600]="article.stock > 0">{{ article.stock }} pièces restantes</p>
              }
            </div>

            <!-- Boutons d'action -->
            <div class="mt-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                (click)="onOrder()"
                [disabled]="article.stock === 0 || isAdding"
                [class.bg-green-600]="isAdding"
                [class.hover:bg-green-700]="isAdding"
                class="flex-1 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-bold text-lg shadow-lg shadow-blue-100 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed group"
              >
                <span class="flex items-center justify-center gap-2">
                  @if (!isAdding) {
                    <svg class="w-5 h-5 group-hover:scale-110 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  } @else {
                    <svg class="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  }
                  {{ isAdding ? 'Ajouté !' : 'Commander' }}
                </span>
              </button>
              <a
                routerLink="/tryon"
                class="flex-1 py-4 bg-black text-white rounded-xl hover:bg-gray-800 transition font-bold text-lg text-center flex items-center justify-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Essai virtuel
              </a>
            </div>
          </div>
        </div>
      } @else {
        <div class="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <svg class="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 class="text-xl font-extrabold text-gray-800 mb-2">Article non trouvé</h2>
          <p class="text-gray-500 mb-8 px-4">Cet article n'est plus disponible ou l'URL est incorrecte.</p>
          <button
            (click)="goBack()"
            class="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition"
          >
            Retourner au catalogue
          </button>
        </div>
      }
    </div>
  `
})
export class ArticleDetailComponent implements OnInit, OnDestroy {
  article: Clothing | null = null;
  loading = true;
  isFavorite = false;
  isAdding = false;
  selectedSize: string = 'M';
  private favoriteIds: number[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private store: Store,
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.store.select(selectFavoriteIds)
      .pipe(takeUntil(this.destroy$))
      .subscribe(ids => {
        this.favoriteIds = ids;
        this.updateFavoriteStatus();
        this.cdr.detectChanges();
      });

    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const id = params.get('id');
        if (id) {
          this.loadArticle(+id);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadArticle(id: number) {
    this.loading = true;
    this.http.get<Clothing>(`${environment.apiUrl}/clothing/${id}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.article = data;
          if (this.article.availableSizes?.length > 0) {
            this.selectedSize = this.article.availableSizes[0];
          }
          this.updateFavoriteStatus();
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.article = null;
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  onOrder() {
    if (!this.article || this.isAdding) return;

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    // Feedback immédiat
    this.isAdding = true;
    this.cdr.detectChanges();

    this.cartService.addToCart(this.article.id, this.selectedSize, 1).subscribe({
      next: () => {
        if (this.article && this.article.stock > 0) {
          this.article.stock--;
        }
        this.cdr.detectChanges();
        
        // Garder le message "Ajouté !" pendant 60 secondes comme demandé pour la soutenance
        setTimeout(() => {
          this.isAdding = false;
          this.cdr.detectChanges();
        }, 60000);
      },
      error: (err) => {
        console.error('Erreur technique lors de l\'ajout au panier', err);
        this.isAdding = false;
        this.cdr.detectChanges();
        
        const errorMsg = err.error?.error || '';
        if (err.status === 401 || err.status === 403 || errorMsg.includes('authentifié')) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  updateFavoriteStatus() {
    if (this.article) {
      this.isFavorite = this.favoriteIds.includes(this.article.id);
    }
  }

  getImageUrl(url: string): string {
    if (!url) return 'assets/placeholder.png';
    if (url.startsWith('http')) return url;
    const baseUrl = environment.apiUrl.replace('/api', '');
    return baseUrl + url;
  }

  getGenderLabel(gender: string): string {
    return gender === 'FEMME' ? 'Femme' : 'Homme';
  }

  getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      'TOP': 'Haut',
      'BOTTOM': 'Pantalon',
      'DRESS': 'Robe'
    };
    return labels[category?.toUpperCase()] || category;
  }

  onToggleFavorite() {
    if (this.article) {
      this.store.dispatch(toggleFavorite({ clothingId: this.article.id }));
    }
  }

  goBack() {
    window.history.back();
  }
}
