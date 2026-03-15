import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

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
  selector: 'app-admin-articles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Articles</h1>
        <button
          (click)="showForm = true; resetForm()"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Ajouter un article
        </button>
      </div>

      <!-- Formulaire -->
      @if (showForm) {
        <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 class="text-lg font-semibold mb-4">
            {{ editingId ? 'Modifier l\\'article' : 'Nouvel article' }}
          </h2>

          <form (ngSubmit)="saveArticle()" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input
                type="text"
                [(ngModel)]="form.name"
                name="name"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Prix (DH)</label>
              <input
                type="number"
                [(ngModel)]="form.price"
                name="price"
                required
                min="0"
                step="0.01"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Genre</label>
              <select
                [(ngModel)]="form.gender"
                name="gender"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selectionner...</option>
                <option value="FEMME">Femme</option>
                <option value="HOMME">Homme</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Categorie</label>
              <select
                [(ngModel)]="form.category"
                name="category"
                required
                (ngModelChange)="onCategoryChange()"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selectionner...</option>
                <option value="TOP">Hauts</option>
                <option value="BOTTOM">Pantalons</option>
                <option value="DRESS">Robes</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input
                type="number"
                [(ngModel)]="form.stock"
                name="stock"
                required
                min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tailles (separees par virgule)</label>
              <input
                type="text"
                [(ngModel)]="form.sizes"
                name="sizes"
                placeholder="S,M,L,XL"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Image</label>
              <input
                type="file"
                (change)="onFileSelected($event)"
                accept="image/*"
                [required]="!editingId"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                [(ngModel)]="form.description"
                name="description"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>

            <div class="md:col-span-2 flex gap-3">
              <button
                type="submit"
                [disabled]="saving"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {{ saving ? 'Enregistrement...' : (editingId ? 'Modifier' : 'Ajouter') }}
              </button>
              <button
                type="button"
                (click)="showForm = false"
                class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      }

      <!-- Liste -->
      @if (!showForm) {
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          @if (articles.length === 0) {
            <div class="text-center py-12 text-gray-500">
              Aucun article
            </div>
          } @else {
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Image</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Nom</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Genre</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Categorie</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Prix</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Stock</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                @for (article of articles; track article.id) {
                  <tr class="hover:bg-gray-50">
                    <td class="px-4 py-3">
                      <img
                        [src]="getImageUrl(article.imageUrl)"
                        [alt]="article.name"
                        class="w-12 h-12 object-cover rounded"
                      />
                    </td>
                    <td class="px-4 py-3 font-medium">{{ article.name }}</td>
                    <td class="px-4 py-3">{{ article.gender }}</td>
                    <td class="px-4 py-3">{{ article.category }}</td>
                    <td class="px-4 py-3">{{ article.price }} DH</td>
                    <td class="px-4 py-3">
                      <span [class]="article.stock > 0 ? 'text-green-600' : 'text-red-600'">
                        {{ article.stock }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex gap-2">
                        <button
                          (click)="editArticle(article)"
                          class="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          (click)="deleteArticle(article.id)"
                          class="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
      }
    </div>
  `
})
export class AdminArticlesComponent implements OnInit {
  articles: Clothing[] = [];
  showForm = false;
  saving = false;
  editingId: number | null = null;
  selectedFile: File | null = null;

  form = {
    name: '',
    description: '',
    category: '',
    gender: '',
    garmentType: '',
    price: 0,
    stock: 0,
    sizes: ''
  };

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadArticles();
  }

  loadArticles() {
    this.http.get<Clothing[]>(`${environment.apiUrl}/admin/clothing`).subscribe({
      next: (data) => {
        this.articles = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur:', err);
      }
    });
  }

  getImageUrl(url: string): string {
    if (url?.startsWith('http')) return url;
    return `${environment.apiUrl.replace('/api', '')}${url}`;
  }

  onCategoryChange() {
    switch (this.form.category) {
      case 'TOP':
        this.form.garmentType = 'upper_body';
        break;
      case 'BOTTOM':
        this.form.garmentType = 'lower_body';
        break;
      case 'DRESS':
        this.form.garmentType = 'dresses';
        break;
      default:
        this.form.garmentType = '';
    }
  }

  resetForm() {
    this.form = {
      name: '',
      description: '',
      category: '',
      gender: '',
      garmentType: '',
      price: 0,
      stock: 0,
      sizes: ''
    };
    this.editingId = null;
    this.selectedFile = null;
  }

  editArticle(article: Clothing) {
    this.editingId = article.id;
    this.form = {
      name: article.name,
      description: article.description || '',
      category: article.category,
      gender: article.gender,
      garmentType: article.garmentType,
      price: article.price,
      stock: article.stock,
      sizes: article.availableSizes.join(',')
    };
    this.showForm = true;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
    }
  }

  saveArticle() {
    this.saving = true;
    const formData = new FormData();

    formData.append('name', this.form.name);
    formData.append('description', this.form.description);
    formData.append('category', this.form.category);
    formData.append('gender', this.form.gender);
    formData.append('garmentType', this.form.garmentType);
    formData.append('price', this.form.price.toString());
    formData.append('stock', this.form.stock.toString());
    formData.append('sizes', this.form.sizes);

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    const url = this.editingId
      ? `${environment.apiUrl}/admin/clothing/${this.editingId}`
      : `${environment.apiUrl}/admin/clothing`;

    const request = this.editingId
      ? this.http.put<Clothing>(url, formData)
      : this.http.post<Clothing>(url, formData);

    request.subscribe({
      next: () => {
        this.showForm = false;
        this.resetForm();
        this.saving = false;
        this.loadArticles();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }

  deleteArticle(id: number) {
    if (confirm('Supprimer cet article ?')) {
      this.http.delete(`${environment.apiUrl}/admin/clothing/${id}`).subscribe({
        next: () => this.loadArticles(),
        error: (err) => console.error('Erreur:', err)
      });
    }
  }
}
