import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="bg-white rounded-xl shadow-sm p-6">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">Mon Panier</h1>

      @if (items.length > 0) {
        <div class="space-y-4">
          @for (item of items; track item.id) {
            <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <!-- TODO: afficher item -->
            </div>
          }
        </div>
      } @else {
        <div class="text-center py-12">
          <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p class="text-gray-500">Votre panier est vide</p>
          <a routerLink="/catalog" class="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Parcourir le catalogue
          </a>
        </div>
      }
    </div>
  `
})
export class CartComponent {
  items: any[] = [];
}
