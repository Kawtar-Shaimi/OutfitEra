import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, UserResponse } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-4xl mx-auto p-6 mt-10">
      <div class="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 transition-all hover:shadow-2xl">
        <div class="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white relative overflow-hidden">
          <div class="relative z-10 flex items-center gap-6">
            <div class="w-24 h-24 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 text-3xl font-bold shadow-inner">
              {{ (user?.firstName?.charAt(0) || 'U') + (user?.lastName?.charAt(0) || '') }}
            </div>
            <div>
              <h1 class="text-3xl font-extrabold">{{ user?.firstName }} {{ user?.lastName }}</h1>
              <p class="text-blue-100 opacity-90 font-medium">{{ user?.email }}</p>
              <div class="flex gap-2 mt-2">
                @for (role of user?.roles; track role) {
                  <span class="px-2 py-0.5 bg-white/20 rounded-lg text-xs font-semibold backdrop-blur-sm border border-white/10 uppercase tracking-wider">
                    {{ role }}
                  </span>
                }
              </div>
            </div>
          </div>
          <!-- Decorative circles -->
          <div class="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div class="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-400/20 rounded-full blur-2xl"></div>
        </div>

        <div class="p-8 lg:p-12">
          <h2 class="text-xl font-bold text-gray-800 mb-8 flex items-center gap-2">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Informations Personnelles
          </h2>

          <form (ngSubmit)="onUpdate()" #profileForm="ngForm" class="space-y-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div class="space-y-2">
                <label class="block text-sm font-semibold text-gray-700 tracking-tight ml-1">Prénom</label>
                <input
                  type="text"
                  [(ngModel)]="editData.firstName"
                  name="firstName"
                  required
                  class="w-full px-5 py-3.5 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-800 font-medium placeholder-gray-400 shadow-sm"
                  placeholder="Votre prénom"
                />
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-semibold text-gray-700 tracking-tight ml-1">Nom</label>
                <input
                  type="text"
                  [(ngModel)]="editData.lastName"
                  name="lastName"
                  required
                  class="w-full px-5 py-3.5 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-800 font-medium placeholder-gray-400 shadow-sm"
                  placeholder="Votre nom"
                />
              </div>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-semibold text-gray-700 tracking-tight ml-1">Adresse Email</label>
              <div class="relative group">
                <input
                  type="email"
                  [(ngModel)]="editData.email"
                  name="email"
                  required
                  email
                  class="w-full pl-5 pr-12 py-3.5 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-800 font-medium placeholder-gray-400 shadow-sm"
                  placeholder="nom@exemple.com"
                />
                <svg class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            <div class="pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
              <p class="text-xs text-gray-400 max-w-sm italic">
                * Vos informations sont stockées en toute sécurité conformément à notre politique de confidentialité.
              </p>
              
              <button
                type="submit"
                [disabled]="loading || !profileForm.valid"
                class="w-full sm:w-auto px-10 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3 group"
              >
                @if (loading) {
                  <svg class="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Mise à jour...</span>
                } @else {
                  <span>Enregistrer les modifications</span>
                  <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                }
              </button>
            </div>

            @if (successMessage) {
              <div class="animate-bounce bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-2xl flex items-center gap-3">
                <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="font-semibold">{{ successMessage }}</span>
              </div>
            }

            @if (errorMessage) {
              <div class="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl flex items-center gap-3">
                <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="font-semibold">{{ errorMessage }}</span>
              </div>
            }
          </form>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  user: UserResponse | null = null;
  editData = {
    firstName: '',
    lastName: '',
    email: ''
  };
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.userService.getProfile().subscribe({
      next: (data) => {
        this.user = data;
        this.editData = {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email
        };
      },
      error: (err) => {
        this.errorMessage = "Impossible de charger le profil";
        console.error(err);
      }
    });
  }

  onUpdate() {
    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.userService.updateProfile(this.editData).subscribe({
      next: (data) => {
        this.user = data;
        this.loading = false;
        this.successMessage = "Profil mis à jour avec succès !";
        // Optionnel: Mettre à jour les infos dans l'AuthService si nécessaire
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = "Erreur lors de la mise à jour : " + (err.error?.message || err.message);
      }
    });
  }
}
