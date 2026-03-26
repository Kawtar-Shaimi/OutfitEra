import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Subscription, interval } from 'rxjs';
import { AdminService } from '../../core/services/admin.service';

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
    <div class="p-4">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900 font-outfit">Tableau de bord</h1>
        <p class="text-gray-500 text-sm">Récapitulatif de votre activité en temps réel (Mise à jour automatique)</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Articles -->
          <div class="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-blue-50 rounded-xl text-blue-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Articles</p>
                <p class="text-xl font-bold text-gray-900 mt-0.5">{{ stats.totalArticles }}</p>
              </div>
            </div>
          </div>

          <!-- Commandes totales -->
          <div class="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Commandes</p>
                <p class="text-xl font-bold text-gray-900 mt-0.5">{{ stats.totalCommandes }}</p>
              </div>
            </div>
          </div>

          <!-- Commandes en cours -->
          <div class="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-amber-50 rounded-xl text-amber-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">En cours</p>
                <p class="text-xl font-bold text-gray-900 mt-0.5">{{ stats.commandesEnCours }}</p>
              </div>
            </div>
          </div>

          <!-- Ventes / Chiffre d'affaires -->
          <div class="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ventes</p>
                <p class="text-xl font-bold text-indigo-700 mt-0.5">{{ stats.chiffreAffaires | number:'1.2-2' }} DH</p>
              </div>
            </div>
          </div>

          <!-- Commandes livrées -->
          <div class="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-green-50 rounded-xl text-green-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Livrées</p>
                <p class="text-xl font-bold text-gray-900 mt-0.5">{{ stats.commandesLivrees }}</p>
              </div>
            </div>
          </div>

          <!-- Utilisateurs -->
          <div class="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-purple-50 rounded-xl text-purple-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Utilisateurs</p>
                <p class="text-xl font-bold text-gray-900 mt-0.5">{{ stats.totalUtilisateurs }}</p>
              </div>
            </div>
          </div>
        </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  stats: Stats = {
    totalArticles: 0,
    totalCommandes: 0,
    commandesEnCours: 0,
    commandesLivrees: 0,
    totalUtilisateurs: 0,
    chiffreAffaires: 0
  };
  loading = false;
  private pollingSub?: Subscription;

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadStats();
    this.startPolling();
  }

  ngOnDestroy() {
    this.stopPolling();
  }

  loadStats() {
    this.loading = true;
    this.adminService.getStats().subscribe({
      next: (data: Stats) => {
        console.log('Stats reçues du serveur:', data);
        this.stats = { ...data };
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Erreur chargement stats:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private startPolling() {
    this.pollingSub = interval(30000).subscribe(() => {
      this.loadStats();
    });
  }

  private stopPolling() {
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
    }
  }
}
