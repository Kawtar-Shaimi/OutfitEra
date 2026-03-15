import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface Stats {
  totalArticles: number;
  totalCommandes: number;
  commandesEnCours: number;
  commandesLivrees: number;
  totalUtilisateurs: number;
  chiffreAffaires: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h1 class="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Articles -->
          <div class="bg-white rounded-xl shadow-sm p-6">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-blue-100 rounded-lg">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <p class="text-sm text-gray-500">Articles</p>
                <p class="text-2xl font-bold text-gray-800">{{ stats.totalArticles }}</p>
              </div>
            </div>
          </div>

          <!-- Commandes totales -->
          <div class="bg-white rounded-xl shadow-sm p-6">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-green-100 rounded-lg">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p class="text-sm text-gray-500">Commandes totales</p>
                <p class="text-2xl font-bold text-gray-800">{{ stats.totalCommandes }}</p>
              </div>
            </div>
          </div>

          <!-- Commandes en cours -->
          <div class="bg-white rounded-xl shadow-sm p-6">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-yellow-100 rounded-lg">
                <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-sm text-gray-500">En cours</p>
                <p class="text-2xl font-bold text-gray-800">{{ stats.commandesEnCours }}</p>
              </div>
            </div>
          </div>

          <!-- Commandes livrées -->
          <div class="bg-white rounded-xl shadow-sm p-6">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-emerald-100 rounded-lg">
                <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p class="text-sm text-gray-500">Livrées</p>
                <p class="text-2xl font-bold text-gray-800">{{ stats.commandesLivrees }}</p>
              </div>
            </div>
          </div>

          <!-- Utilisateurs -->
          <div class="bg-white rounded-xl shadow-sm p-6">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-purple-100 rounded-lg">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <p class="text-sm text-gray-500">Utilisateurs</p>
                <p class="text-2xl font-bold text-gray-800">{{ stats.totalUtilisateurs }}</p>
              </div>
            </div>
          </div>

          <!-- Chiffre d'affaires -->
          <div class="bg-white rounded-xl shadow-sm p-6">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-indigo-100 rounded-lg">
                <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-sm text-gray-500">Chiffre d'affaires</p>
                <p class="text-2xl font-bold text-gray-800">{{ stats.chiffreAffaires | number:'1.2-2' }} DH</p>
              </div>
            </div>
          </div>
        </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  stats: Stats = {
    totalArticles: 0,
    totalCommandes: 0,
    commandesEnCours: 0,
    commandesLivrees: 0,
    totalUtilisateurs: 0,
    chiffreAffaires: 0
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.http.get<Stats>(`${environment.apiUrl}/admin/stats`).subscribe({
      next: (data) => {
        this.stats = data;
      },
      error: (err) => {
        console.error('Erreur chargement stats:', err);
      }
    });
  }
}
