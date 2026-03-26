import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-height-custom py-16 flex items-center justify-center">
      <div class="bg-white rounded-3xl shadow-xl max-w-md w-full p-8 text-center border border-gray-100">
        <div class="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 class="text-3xl font-bold text-gray-800 mb-3">Commande confirmée !</h1>
        
        <div class="bg-blue-50 text-blue-800 rounded-xl p-4 mb-8 font-medium border border-blue-100">
          Commande #{{ orderId }}
        </div>

        <p class="text-gray-600 mb-8 leading-relaxed">
          Merci pour votre achat ! Nous avons bien reçu votre commande et vous serez contacté très prochainement pour la livraison.
        </p>
        
        <a routerLink="/catalog" class="block w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition shadow-lg hover:shadow-xl">
          Retour au catalogue
        </a>
      </div>
    </div>
  `
})
export class OrderSuccessComponent implements OnInit {
  orderId: string | null = null;
  
  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.orderId = this.route.snapshot.paramMap.get('id');
  }
}
