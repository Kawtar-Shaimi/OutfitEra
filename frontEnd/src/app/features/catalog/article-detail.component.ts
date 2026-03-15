import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { environment } from '../../../environments/environment';
import { toggleFavorite } from '../../store/favorites/favorites.actions';
import { selectFavoriteIds } from '../../store/favorites/favorites.selectors';

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
            <div class="aspect-square bg-gray-100 rounded-xl overflow-hidden">
              <img
                [src]="getImageUrl(article.imageUrl)"
                [alt]="article.name"
                class="w-full h-full object-cover"
              />
            </div>
            <!-- Badge rupture de stock -->
            @if (article.stock === 0) {
              <div class="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white text-sm font-medium rounded-full">
                Rupture de stock
              </div>
            }
            <!-- Bouton favori -->
            <button
              class="absolute top-4 right-4 p-3 bg-white rounded-full shadow-md hover:bg-gray-100 transition"
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
            <div class="flex items-center gap-2 mb-2">
              <span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                {{ getGenderLabel(article.gender) }}
              </span>
              <span class="px-2 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded">
                {{ getCategoryLabel(article.category) }}
              </span>
            </div>

            <!-- Nom -->
            <h1 class="text-2xl font-bold text-gray-800 mb-2">{{ article.name }}</h1>

            <!-- Prix -->
            <p class="text-3xl font-bold text-blue-600 mb-4">{{ article.price }} DH</p>

            <!-- Description -->
            @if (article.description) {
              <div class="mb-6">
                <h3 class="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                <p class="text-gray-600">{{ article.description }}</p>
              </div>
            }

            <!-- Type de vêtement -->
            @if (article.garmentType) {
              <div class="mb-4">
                <h3 class="text-sm font-semibold text-gray-700 mb-1">Type</h3>
                <p class="text-gray-600">{{ article.garmentType }}</p>
              </div>
            }

            <!-- Tailles disponibles -->
            <div class="mb-6">
              <h3 class="text-sm font-semibold text-gray-700 mb-2">Tailles disponibles</h3>
              @if (article.availableSizes && article.availableSizes.length > 0) {
                <div class="flex flex-wrap gap-2">
                  @for (size of article.availableSizes; track size) {
                    <span class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-blue-500 hover:text-blue-600 cursor-pointer transition">
                      {{ size }}
                    </span>
                  }
                </div>
              } @else {
                <p class="text-gray-500">Non spécifié</p>
              }
            </div>

            <!-- Stock -->
            <div class="mb-6">
              <h3 class="text-sm font-semibold text-gray-700 mb-1">Disponibilité</h3>
              @if (article.stock > 0) {
                <p class="text-green-600 font-medium">En stock ({{ article.stock }} disponibles)</p>
              } @else {
                <p class="text-red-500 font-medium">Rupture de stock</p>
              }
            </div>

            <!-- Boutons d'action -->
            <div class="mt-auto space-y-3">
              <button
                [disabled]="article.stock === 0"
                class="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Commander
              </button>
              <a
                routerLink="/tryon"
                class="block w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium text-center"
              >
                Essayer virtuellement
              </a>
            </div>
          </div>
        </div>
      } @else {
        <div class="text-center py-12">
          <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-gray-500">Article non trouvé</p>
          <button
            (click)="goBack()"
            class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Retour au catalogue
          </button>
        </div>
      }
    </div>
  `
})
export class ArticleDetailComponent implements OnInit {
  article: Clothing | null = null;
  loading = true;
  isFavorite = false;
  private favoriteIds: number[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private store: Store
  ) {}

  ngOnInit() {
    this.store.select(selectFavoriteIds).subscribe(ids => {
      this.favoriteIds = ids;
      this.updateFavoriteStatus();
      this.cdr.detectChanges();
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadArticle(+id);
      }
    });
  }

  loadArticle(id: number) {
    this.loading = true;
    this.http.get<Clothing>(`${environment.apiUrl}/clothing/${id}`).subscribe({
      next: (data) => {
        this.article = data;
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
