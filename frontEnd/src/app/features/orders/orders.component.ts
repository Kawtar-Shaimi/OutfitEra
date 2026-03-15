import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-xl shadow-sm p-6">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">Mes Commandes</h1>

      @if (orders.length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          @for (order of orders; track order.id) {
            <div class="bg-gray-100 rounded-lg p-4">
              <!-- TODO: afficher order -->
            </div>
          }
        </div>
      } @else {
        <div class="text-center py-12">
          <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p class="text-gray-500">Aucune commande</p>
        </div>
      }
    </div>
  `
})
export class OrdersComponent {
  orders: any[] = [];
}
