import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';
import { userGuard } from './core/guards/user.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./shared/layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [userGuard],
    children: [
      {
        path: '',
        redirectTo: 'catalog',
        pathMatch: 'full'
      },
      {
        path: 'tryon',
        loadComponent: () => import('./features/tryon/tryon.component').then(m => m.TryonComponent)
      },
      {
        path: 'catalog',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/catalog/catalog.component').then(m => m.CatalogComponent)
          },
          {
            path: ':gender/:category',
            loadComponent: () => import('./features/catalog/catalog.component').then(m => m.CatalogComponent)
          }
        ]
      },
      {
        path: 'article/:id',
        loadComponent: () => import('./features/catalog/article-detail.component').then(m => m.ArticleDetailComponent)
      },
      {
        path: 'gallery',
        loadComponent: () => import('./features/gallery/gallery.component').then(m => m.GalleryComponent)
      },
      {
        path: 'favorites',
        loadComponent: () => import('./features/favorites/favorites.component').then(m => m.FavoritesComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./features/orders/orders.component').then(m => m.OrdersComponent)
      },
      {
        path: 'cart',
        loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent)
      }
    ]
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin/layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./admin/pages/dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'articles',
        loadComponent: () => import('./admin/pages/articles.component').then(m => m.AdminArticlesComponent)
      },
      {
        path: 'commandes',
        loadComponent: () => import('./admin/pages/commandes.component').then(m => m.AdminCommandesComponent)
      }
    ]
  }
];
