import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService, CartItemResponse } from '../../core/services/cart.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="bg-white rounded-xl shadow-sm p-6 max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">Mon Panier</h1>

      @if (items.length > 0) {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Liste des articles -->
          <div class="lg:col-span-2 space-y-4">
            @for (item of items; track item.id) {
              <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition">
                <img 
                  [src]="getImageUrl(item.imageUrl)" 
                  [alt]="item.clothingName" 
                  class="w-24 h-24 object-cover rounded-lg shadow-sm"
                >
                <div class="flex-1 min-w-0">
                  <h3 class="font-semibold text-gray-800 truncate">{{ item.clothingName }}</h3>
                  <p class="text-sm text-gray-500">Taille : {{ item.size }}</p>
                  <div class="flex items-center gap-3 mt-2">
                    <button 
                      (click)="updateQuantity(item, item.quantity - 1)"
                      class="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 transition"
                      [disabled]="item.quantity <= 1 || isProcessing"
                    >-</button>
                    <span class="font-medium w-4 text-center">{{ item.quantity }}</span>
                    <button 
                      (click)="updateQuantity(item, item.quantity + 1)"
                      class="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 transition"
                      [disabled]="isProcessing"
                    >+</button>
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-bold text-blue-600 whitespace-nowrap">{{ item.subTotal }} DH</p>
                  <button 
                    (click)="confirmRemove(item)"
                    class="mt-2 text-red-500 text-sm hover:underline flex items-center gap-1 ml-auto"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Supprimer
                  </button>
                </div>
              </div>
            }

            <button 
              (click)="confirmClear()"
              class="text-gray-500 text-sm hover:text-red-500 flex items-center gap-1 transition"
            >
              Vider le panier
            </button>
          </div>

          <!-- Résumé -->
          <div class="lg:col-span-1">
            <div class="bg-gray-50 rounded-2xl p-6 border border-gray-100 sticky top-24">
              <h2 class="text-lg font-bold text-gray-800 mb-4">Résumé de la commande</h2>
              <div class="space-y-3 pb-4 border-b border-gray-200">
                <div class="flex justify-between text-gray-600">
                  <span>Sous-total</span>
                  <span>{{ total }} DH</span>
                </div>
                <div class="flex justify-between text-gray-600">
                  <span>Livraison</span>
                  <span class="text-green-600 font-medium">Gratuite</span>
                </div>
              </div>
              <div class="flex justify-between items-center pt-4 mb-6">
                <span class="text-lg font-bold text-gray-800">Total</span>
                <span class="text-2xl font-extrabold text-blue-600">{{ total }} DH</span>
              </div>
              <button class="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 shadow-lg shadow-blue-200 transition transform hover:-translate-y-0.5 active:translate-y-0">
                Valider la commande
              </button>
            </div>
          </div>
        </div>
      } @else {
        <div class="text-center py-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <div class="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <svg class="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 class="text-xl font-bold text-gray-800 mb-2">Votre panier est vide</h2>
          <p class="text-gray-500 mb-8 max-w-xs mx-auto">Trouvez votre tenue idéale parmi nos nouveaux vêtements AI-ready.</p>
          <a routerLink="/catalog" class="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition">
            Parcourir le catalogue
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      }

      <!-- Custom Confirmation Modal -->
      @if (showModal) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-in fade-in duration-200">
          <div class="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 transform animate-in zoom-in-95 duration-200">
            <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-center text-gray-800 mb-2">Confirmation</h3>
            <p class="text-center text-gray-500 mb-8">
              {{ modalMessage }}
            </p>
            <div class="flex gap-3">
              <button 
                (click)="closeModal()"
                class="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
              >
                Annuler
              </button>
              <button 
                (click)="confirmAction()"
                class="flex-1 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class CartComponent implements OnInit {
  items: CartItemResponse[] = [];
  total: number = 0;
  isProcessing = false;

  // Modal State
  showModal = false;
  modalMessage = '';
  modalType: 'REMOVE' | 'CLEAR' = 'REMOVE';
  selectedItemId: number | null = null;

  constructor(
    private cartService: CartService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cartService.cart$.subscribe(cart => {
      this.items = cart?.items || [];
      this.total = cart?.totalAmount || 0;
      this.cdr.detectChanges();
    });
    this.cartService.loadCart();
  }

  getImageUrl(url: string): string {
    if (!url) return 'assets/placeholder.png';
    if (url.startsWith('http')) return url;
    const baseUrl = environment.apiUrl.replace('/api', '');
    return baseUrl + url;
  }

  updateQuantity(item: CartItemResponse, newQuantity: number) {
    if (newQuantity < 1 || this.isProcessing) return;

    // Mise à jour optimiste locale pour éviter le "double clic"
    const oldQuantity = item.quantity;
    const oldSubTotal = item.subTotal;
    
    item.quantity = newQuantity;
    item.subTotal = item.unitPrice * newQuantity;
    
    // Recalculer le total dynamiquement pour le retour visuel immédiat
    this.total = this.items.reduce((acc, i) => acc + i.subTotal, 0);
    this.cdr.detectChanges();

    this.isProcessing = true;
    this.cartService.updateQuantity(item.id, newQuantity).subscribe({
      next: () => {
        this.isProcessing = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        // Revenir en arrière en cas d'erreur
        item.quantity = oldQuantity;
        item.subTotal = oldSubTotal;
        this.total = this.items.reduce((acc, i) => acc + i.subTotal, 0);
        this.isProcessing = false;
        this.cdr.detectChanges();
        console.error('Erreur mise à jour quantité', err);
      }
    });
  }

  confirmRemove(item: CartItemResponse) {
    this.modalType = 'REMOVE';
    this.selectedItemId = item.id;
    this.modalMessage = `Voulez-vous retirer "${item.clothingName}" du panier ?`;
    this.showModal = true;
  }

  confirmClear() {
    this.modalType = 'CLEAR';
    this.modalMessage = 'Voulez-vous vider tout votre panier ?';
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedItemId = null;
  }

  confirmAction() {
    if (this.modalType === 'REMOVE' && this.selectedItemId) {
      this.removeItem(this.selectedItemId);
    } else if (this.modalType === 'CLEAR') {
      this.clearCartAction();
    }
    this.closeModal();
  }

  private removeItem(itemId: number) {
    this.cartService.removeFromCart(itemId).subscribe();
  }

  private clearCartAction() {
    this.cartService.clearCart().subscribe();
  }
}
