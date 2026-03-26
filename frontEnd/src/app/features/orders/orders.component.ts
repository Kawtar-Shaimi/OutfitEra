import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService, OrderResponse } from '../../core/services/order.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-xl shadow-sm p-6 max-w-5xl mx-auto">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">Mes Commandes</h1>

      @if (loading) {
        <div class="flex justify-center items-center py-12">
          <svg class="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      } @else if (orders.length > 0) {
        <div class="space-y-6">
          @for (order of orders; track order.id) {
            <div class="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition bg-gray-50">
              <div class="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-200 pb-4 mb-4">
                <div>
                  <h2 class="text-lg font-bold text-gray-800">Commande #{{ order.id }}</h2>
                  <p class="text-sm text-gray-500">Passée le {{ order.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
                </div>
                <div class="mt-4 md:mt-0 flex flex-col items-end">
                  <span class="px-4 py-1.5 rounded-full text-sm font-semibold mb-2" 
                        [class]="getStatusClass(order.status)">
                    {{ getStatusLabel(order.status) }}
                  </span>
                  <p class="text-lg font-extrabold text-blue-600">{{ order.totalAmount }} DH</p>
                </div>
              </div>

              <div class="mb-4">
                <p class="text-sm text-gray-600 font-medium mb-1">Mode de paiement: 
                  <span class="text-gray-800">{{ getPaymentMethodLabel(order.paymentMethod) }}</span>
                </p>
              </div>

              <div class="space-y-3">
                <h3 class="text-md font-semibold text-gray-800">Articles</h3>
                @for (item of order.items || []; track item.id) {
                  <div class="flex items-center gap-4 bg-white p-3 rounded-xl border border-gray-100">
                    <img [src]="getImageUrl(item.imageUrl)" [alt]="item.clothingName" class="w-16 h-16 object-cover rounded-lg shadow-sm">
                    <div class="flex-1">
                      <h4 class="font-medium text-gray-800">{{ item.clothingName }}</h4>
                      <p class="text-sm text-gray-500">Taille: {{ item.size }} | Qté: {{ item.quantity }}</p>
                    </div>
                    <div class="font-semibold text-gray-800">
                      {{ item.subTotal }} DH
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="text-center py-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <div class="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 class="text-xl font-bold text-gray-800 mb-2">Vous n'avez passé aucune commande</h2>
          <p class="text-gray-500">Retrouvez toutes vos futures commandes ici.</p>
        </div>
      }
    </div>
  `
})
export class OrdersComponent implements OnInit {
  orders: OrderResponse[] = [];
  loading = true;

  constructor(
    private orderService: OrderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.orderService.getUserOrders().subscribe({
      next: (data) => {
        this.orders = data || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des commandes', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getStatusLabel(status: string): string {
    switch(status) {
      case 'PENDING':
      case 'EN_ATTENTE': return 'En attente';
      case 'PAID': return 'Payée';
      case 'SHIPPED': return 'Expédiée';
      case 'DELIVERED': return 'Livrée';
      case 'CANCELLED': return 'Annulée';
      default: return status;
    }
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'PENDING':
      case 'EN_ATTENTE': return 'bg-yellow-100 text-yellow-800';
      case 'PAID': return 'bg-blue-100 text-blue-800';
      case 'SHIPPED': return 'bg-indigo-100 text-indigo-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getPaymentMethodLabel(method: string): string {
    if (method === 'CARD') return '💳 Paiement par carte (à la livraison)';
    if (method === 'CASH') return '💵 Paiement en espèces (à la livraison)';
    return method;
  }

  getImageUrl(url: string): string {
    if (!url) return 'assets/placeholder.png';
    if (url.startsWith('http')) return url;
    const baseUrl = environment.apiUrl.replace('/api', '');
    return baseUrl + url;
  }
}
