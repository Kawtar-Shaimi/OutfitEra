import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Ne pas ajouter de token sur les routes d'auth
  if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
    return next(req);
  }

  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  if (token) {
    // Vérifier si le token est expiré
    if (authService.isTokenExpired(token)) {
      // Token expiré, on le supprime et on redirige vers login
      authService.logout();
      router.navigate(['/login']);
      return next(req);
    }

    // Token valide, on l'ajoute à la requête
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
