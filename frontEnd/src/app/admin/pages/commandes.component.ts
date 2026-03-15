import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface OrderItem {
  id: number;
  clothingId: number;
  clothingName: string;
  size: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  userId: number;
  userEmail: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  shippingAddress: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-admin-commandes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Commandes</h1>

        <!-- Filtres -->
        <div class="flex gap-2">
          <button
            (click)="filterStatus = ''; loadOrders()"
            [class]="filterStatus === '' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700'"
            class="px-3 py-1.5 rounded-lg text-sm font-medium transition"
          >
            Toutes
          </button>
          <button
            (click)="filterStatus = 'PENDING'; loadOrders()"
            [class]="filterStatus === 'PENDING' ? 'bg-yellow-500 text-white' : 'bg-yellow-100 text-yellow-700'"
            class="px-3 py-1.5 rounded-lg text-sm font-medium transition"
          >
            En attente
          </button>
          <button
            (click)="filterStatus = 'DELIVERED'; loadOrders()"
            [class]="filterStatus === 'DELIVERED' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700'"
            class="px-3 py-1.5 rounded-lg text-sm font-medium transition"
          >
            Livrées
          </button>
          <button
            (click)="filterStatus = 'CANCELLED'; loadOrders()"
            [class]="filterStatus === 'CANCELLED' ? 'bg-red-500 text-white' : 'bg-red-100 text-red-700'"
            class="px-3 py-1.5 rounded-lg text-sm font-medium transition"
          >
            Annulées
          </button>
        </div>
      </div>

      <!-- Liste des commandes -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        @if (orders.length === 0) {
          <div class="text-center py-12 text-gray-500">
            Aucune commande
          </div>
        } @else {
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">ID</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Client</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Articles</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Total</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Statut</th>
                <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              @for (order of orders; track order.id) {
                <tr class="hover:bg-gray-50">
                  <td class="px-4 py-3 font-medium">#{{ order.id }}</td>
                  <td class="px-4 py-3">
                    <div class="text-sm">{{ order.userEmail }}</div>
                    <div class="text-xs text-gray-500 truncate max-w-[200px]">{{ order.shippingAddress }}</div>
                  </td>
                  <td class="px-4 py-3">
                    <div class="text-sm">
                      @for (item of order.items; track item.id; let last = $last) {
                        <span>{{ item.quantity }}x {{ item.clothingName }} ({{ item.size }}){{ last ? '' : ', ' }}</span>
                      }
                    </div>
                  </td>
                  <td class="px-4 py-3 font-medium">{{ order.totalAmount }} DH</td>
                  <td class="px-4 py-3 text-sm text-gray-500">
                    {{ formatDate(order.createdAt) }}
                  </td>
                  <td class="px-4 py-3">
                    <span [class]="getStatusClass(order.status)" class="px-2 py-1 rounded-full text-xs font-medium">
                      {{ getStatusLabel(order.status) }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                      <!-- Bouton voir détails -->
                      <button
                        (click)="viewOrder(order)"
                        class="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                        title="Voir détails"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>

                      <!-- Dropdown changement statut -->
                      <select
                        [value]="order.status"
                        (change)="updateStatus(order.id, $event)"
                        class="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500"
                        [disabled]="order.status === 'DELIVERED' || order.status === 'CANCELLED'"
                      >
                        <option value="PENDING">En attente</option>
                        <option value="DELIVERED">Livrée</option>
                        <option value="CANCELLED">Annulée</option>
                      </select>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>

      <!-- Modal détails commande -->
      @if (selectedOrder) {
        <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div class="p-6">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-bold">Commande #{{ selectedOrder.id }}</h2>
                <button (click)="selectedOrder = null" class="p-2 hover:bg-gray-100 rounded-lg">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Infos client -->
              <div class="mb-6">
                <h3 class="text-sm font-medium text-gray-500 mb-2">Client</h3>
                <p class="font-medium">{{ selectedOrder.userEmail }}</p>
                <p class="text-sm text-gray-600">{{ selectedOrder.shippingAddress }}</p>
              </div>

              <!-- Statut -->
              <div class="mb-6">
                <h3 class="text-sm font-medium text-gray-500 mb-2">Statut</h3>
                <span [class]="getStatusClass(selectedOrder.status)" class="px-3 py-1 rounded-full text-sm font-medium">
                  {{ getStatusLabel(selectedOrder.status) }}
                </span>
              </div>

              <!-- Articles -->
              <div class="mb-6">
                <h3 class="text-sm font-medium text-gray-500 mb-2">Articles</h3>
                <div class="border rounded-lg divide-y">
                  @for (item of selectedOrder.items; track item.id) {
                    <div class="p-3 flex justify-between items-center">
                      <div>
                        <p class="font-medium">{{ item.clothingName }}</p>
                        <p class="text-sm text-gray-500">Taille: {{ item.size }} | Qté: {{ item.quantity }}</p>
                      </div>
                      <p class="font-medium">{{ item.price * item.quantity }} DH</p>
                    </div>
                  }
                </div>
              </div>

              <!-- Total -->
              <div class="flex justify-between items-center pt-4 border-t">
                <span class="text-lg font-medium">Total</span>
                <span class="text-xl font-bold text-blue-600">{{ selectedOrder.totalAmount }} DH</span>
              </div>

              <!-- Dates -->
              <div class="mt-6 text-sm text-gray-500">
                <p>Créée le: {{ formatDate(selectedOrder.createdAt) }}</p>
                <p>Mise à jour: {{ formatDate(selectedOrder.updatedAt) }}</p>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class AdminCommandesComponent implements OnInit {
  orders: Order[] = [];
  filterStatus = '';
  selectedOrder: Order | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    const url = this.filterStatus
      ? `${environment.apiUrl}/admin/orders?status=${this.filterStatus}`
      : `${environment.apiUrl}/admin/orders`;

    this.http.get<Order[]>(url).subscribe({
      next: (data) => {
        this.orders = data;
      },
      error: (err) => {
        console.error('Erreur:', err);
      }
    });
  }

  updateStatus(orderId: number, event: Event) {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value;

    this.http.put(`${environment.apiUrl}/admin/orders/${orderId}/status?status=${newStatus}`, {}).subscribe({
      next: () => {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
          order.status = newStatus;
        }
        if (this.selectedOrder?.id === orderId) {
          this.selectedOrder.status = newStatus;
        }
      },
      error: (err) => {
        console.error('Erreur:', err);
        select.value = this.orders.find(o => o.id === orderId)?.status || 'PENDING';
      }
    });
  }

  viewOrder(order: Order) {
    this.selectedOrder = order;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'PENDING': 'En attente',
      'DELIVERED': 'Livrée',
      'CANCELLED': 'Annulée'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'DELIVERED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }
}
