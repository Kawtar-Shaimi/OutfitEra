# Outfitera Frontend - Angular

Frontend de l'application Outfitera avec essayage virtuel IA.

## Prérequis

- Node.js 18+
- npm 10+

## Installation

```bash
cd frontend
npm install
```

## Lancer l'application

```bash
npm start
```

L'app sera accessible sur http://localhost:4200

## Structure

```
src/app/
├── core/                   # Services, guards, interceptors
│   ├── services/
│   │   └── auth.service.ts
│   └── interceptors/
│       └── auth.interceptor.ts
├── shared/                 # Composants réutilisables
│   ├── layout/            # Header, Sidebar
│   └── models/
│       ├── user.model.ts
│       └── clothing.model.ts
├── features/               # Modules fonctionnels
│   ├── auth/              # Login, register
│   ├── catalog/           # Liste vêtements
│   ├── tryon/             # Essayage virtuel IA
│   ├── cart/              # Panier (TODO)
│   ├── favorites/         # Favoris (TODO)
│   ├── orders/            # Commandes (TODO)
│   └── gallery/           # Galerie (TODO)
└── store/                  # NgRx
    ├── auth/
    └── tryon/
```

## Technologies

- **Angular 21** (standalone components)
- **Tailwind CSS** - Styling
- **NgRx** - State management
- **RxJS** - Reactive programming

## Parties à implémenter

Les features suivantes doivent être développées :

### 1. Cart (Panier)
```
features/cart/
├── cart.component.ts
├── cart.component.html
└── cart-item/cart-item.component.ts

store/cart/
├── cart.actions.ts
├── cart.reducer.ts
├── cart.effects.ts
└── cart.selectors.ts
```

### 2. Orders (Commandes)
```
features/orders/
├── order-list.component.ts
├── order-detail.component.ts
└── checkout.component.ts
```

### 3. Gallery (Galerie)
```
features/gallery/
├── gallery.component.ts
└── gallery-item.component.ts
```

### 4. Admin
```
features/admin/
├── catalog-management.component.ts
├── moderation.component.ts
└── stats.component.ts
```

### 5. Notifications
```
shared/components/notification/
├── notification-list.component.ts
└── notification-icon.component.ts
```

## Services à créer

```typescript
// core/services/cart.service.ts
export class CartService {
  addToCart(clothingId: number, size: string, quantity: number) {}
  removeFromCart(itemId: number) {}
  getCart() {}
}

// core/services/order.service.ts
export class OrderService {
  createOrder(orderData: any) {}
  getMyOrders() {}
  getOrderById(id: number) {}
}

// core/services/notification.service.ts
export class NotificationService {
  getNotifications() {}
  markAsRead(id: number) {}
}
```

## Commandes utiles

```bash
# Générer un composant
ng g c features/cart/cart

# Générer un service
ng g s core/services/cart

# Lancer les tests
npm test

# Build production
npm run build
```

## Intégration API

L'API backend tourne sur `http://localhost:8080`

Les endpoints sont définis dans les services (`core/services/`)

## Tailwind

Les classes Tailwind sont utilisables directement dans les templates HTML.

Exemples :
```html
<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  Essayer
</button>
```

## NgRx Store

Le store est configuré dans `app.config.ts`

Pour utiliser le store dans un composant :
```typescript
constructor(private store: Store) {}

ngOnInit() {
  this.store.select(selectUser).subscribe(user => {
    console.log(user);
  });
}
```

Voir `TODO.md` pour les détails d'implémentation.
