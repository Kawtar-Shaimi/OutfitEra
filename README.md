# 🛍️ OutfitEra - Plateforme Intelligente d'Essayage Virtuel

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.1-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **OutfitEra** est une plateforme web intelligente de mode combinant e-commerce, essayage virtuel, IA, et gamification pour offrir une expérience d'achat immersive et personnalisée.

---

## 📋 Table des Matières

- [À Propos](#-à-propos)
- [Fonctionnalités](#-fonctionnalités)
- [Technologies](#-technologies)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Utilisation](#-utilisation)
- [API Documentation](#-api-documentation)
- [Contribution](#-contribution)
- [Auteurs](#-auteurs)

---

## 🎯 À Propos

**OutfitEra** révolutionne l'expérience d'achat en ligne en permettant aux utilisateurs de :
- 👗 **Essayer virtuellement** des vêtements et créer des looks complets
- 🛒 **Acheter en ligne** de manière sécurisée
- 🤖 **Bénéficier de l'IA** pour des recommandations personnalisées
- 🏆 **Gagner des badges** et récompenses via la gamification
- 👥 **Partager avec la communauté** leurs créations de looks

---

## ✨ Fonctionnalités

### Fonctionnalités Principales

#### 🔐 Authentification & Sécurité
- Inscription et connexion sécurisées
- Authentification JWT (JSON Web Token)
- Gestion des rôles (Admin, Utilisateur)
- Protection des données utilisateurs

#### 👔 Gestion du Catalogue (Admin)
- **Catégories** : Hauts, Pantalons, Robes, Chaussures, Accessoires
- **Produits** : Nom, description, prix, tailles, stock
- **Collections thématiques** : Looks prédéfinis avec réductions

#### 👀 Essayage Virtuel
- Essayage de vêtements individuels
- Création de looks complets (haut + bas + accessoires)
- Calcul automatique du prix total
- Sauvegarde des looks favoris

#### 🛍️ Panier & Commande
- Ajout de vêtements individuels ou looks complets
- Sélection de tailles
- Paiement en ligne sécurisé
- Récapitulatif de commande

#### ⭐ Avis & Notes
- Attribution de notes
- Commentaires sur les looks
- Consultation des avis
- Tableau de bord admin (produits populaires, meilleures ventes)

#### 🔔 Notifications
- Notifications en temps réel
- Historique des notifications
- Alertes pour commandes, avis, badges

### Fonctionnalités BONUS

#### 🌐 Galerie Publique & Modération
- Partage de looks avec la communauté
- Modération par l'administrateur
- Validation/refus avec motif

#### 🎮 Gamification
- **Badges** : Utilisateur actif, Acheteur fidèle, Créateur populaire
- **Récompenses** : Réductions exclusives
- Notifications d'obtention de badges

---

## 🛠️ Technologies

### Backend
- **Framework** : Spring Boot 4.0.1
- **Langage** : Java 21
- **Sécurité** : Spring Security + JWT
- **ORM** : Spring Data JPA + Hibernate
- **Base de données** : PostgreSQL / MySQL
- **Build** : Maven
- **Outils** : Lombok, MapStruct

### Frontend (À venir)
- **Framework** : Angular
- **UI** : Angular Material
- **State Management** : RxJS

### Intelligence Artificielle
- **Spring AI** : Recommandations personnalisées
- **Essayage virtuel** : Suggestions de looks

---

## 🏗️ Architecture

Le projet suit les principes de **Clean Architecture** avec une séparation claire des responsabilités :

```
OutfitEra/
└── backend/
    └── src/main/java/com/intern/demo/
        ├── entity/           # Entités JPA
        │   └── enums/        # Énumérations
        ├── dto/              # Data Transfer Objects
        │   ├── request/      # DTOs de requête
        │   └── response/     # DTOs de réponse
        ├── repository/       # Accès aux données
        ├── service/          # Logique métier
        │   └── impl/         # Implémentations
        ├── controller/       # API REST
        ├── mapper/           # Conversions Entity ↔ DTO
        ├── security/         # Configuration JWT
        ├── exception/        # Gestion des erreurs
        └── config/           # Configuration
```

### Flux de Communication
```
Client → Controller → Service → Repository → Database
           ↓            ↓          ↓
         DTO       Business    Entity
                    Logic
```

---

## 🚀 Installation

### Prérequis
- **Java 21** ou supérieur
- **Maven 3.8+**
- **PostgreSQL 14+** ou **MySQL 8+**
- **Git**

### Étapes d'Installation

1. **Cloner le repository**
   ```bash
   git clone https://github.com/Kawtar-Shaimi/OutfitEra.git
   cd OutfitEra/backend
   ```

2. **Configurer la base de données**
   
   Créer une base de données PostgreSQL ou MySQL :
   ```sql
   CREATE DATABASE outfitera_db;
   ```

3. **Configurer les variables d'environnement**
   
   Copier le fichier `.env_example` en `.env` :
   ```bash
   cp .env_example .env
   ```
   
   Éditer `.env` avec vos configurations :
   ```properties
   # Database Configuration
   DB_URL=jdbc:postgresql://localhost:5432/outfitera_db
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   
   # JWT Configuration
   JWT_SECRET=your_secret_key_here
   JWT_EXPIRATION=86400000
   
   # Spring AI Configuration (Optional)
   SPRING_AI_API_KEY=your_api_key
   ```

4. **Installer les dépendances**
   ```bash
   mvn clean install
   ```

5. **Lancer l'application**
   ```bash
   mvn spring-boot:run
   ```

L'application sera accessible sur : `http://localhost:8080`

---

## ⚙️ Configuration

### application.yaml

Configuration de base dans `src/main/resources/application.yaml` :

```yaml
spring:
  application:
    name: OutfitEra
  
  datasource:
    url: ${DB_URL}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    driver-class-name: org.postgresql.Driver
  
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        format_sql: true
  
  security:
    jwt:
      secret: ${JWT_SECRET}
      expiration: ${JWT_EXPIRATION}

server:
  port: 8080
```

### Variables d'Environnement

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DB_URL` | URL de la base de données | `jdbc:postgresql://localhost:5432/outfitera_db` |
| `DB_USERNAME` | Nom d'utilisateur BDD | `postgres` |
| `DB_PASSWORD` | Mot de passe BDD | `password` |
| `JWT_SECRET` | Clé secrète JWT | `mySecretKey123` |
| `JWT_EXPIRATION` | Durée de validité JWT (ms) | `86400000` (24h) |
| `SPRING_AI_API_KEY` | Clé API Spring AI | `your_api_key` |

---

## 📖 Utilisation

### Démarrage Rapide

1. **Lancer l'application**
   ```bash
   mvn spring-boot:run
   ```

2. **Accéder à l'API**
   - API Base URL : `http://localhost:8080/api`
   - Swagger UI : `http://localhost:8080/swagger-ui.html` (à venir)

3. **Créer un compte administrateur** (première utilisation)
   ```bash
   # Via script SQL ou endpoint d'initialisation
   ```

### Endpoints Principaux

#### Authentification
```http
POST /api/auth/register    # Inscription
POST /api/auth/login       # Connexion
```

#### Produits
```http
GET    /api/products              # Liste des produits
GET    /api/products/{id}         # Détails d'un produit
POST   /api/products              # Créer un produit (Admin)
PUT    /api/products/{id}         # Modifier un produit (Admin)
DELETE /api/products/{id}         # Supprimer un produit (Admin)
```

#### Looks
```http
GET    /api/looks                 # Liste des looks
POST   /api/looks                 # Créer un look
GET    /api/looks/{id}            # Détails d'un look
POST   /api/looks/{id}/favorite   # Ajouter aux favoris
```

#### Commandes
```http
GET    /api/orders                # Mes commandes
POST   /api/orders                # Passer une commande
GET    /api/orders/{id}           # Détails d'une commande
```

---

## 📚 API Documentation

La documentation complète de l'API sera disponible via **Swagger UI** une fois l'implémentation terminée.

**URL** : `http://localhost:8080/swagger-ui.html`

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment contribuer :

1. **Fork** le projet
2. **Créer** une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. **Commit** vos changements (`git commit -m 'Add some AmazingFeature'`)
4. **Push** vers la branche (`git push origin feature/AmazingFeature`)
5. **Ouvrir** une Pull Request

### Conventions de Code
- Suivre les conventions Java standard
- Utiliser Lombok pour réduire le boilerplate
- Documenter les méthodes publiques avec Javadoc
- Écrire des tests unitaires

---

## 📝 Roadmap

- [x] Définir l'architecture globale
- [ ] Implémenter les entités et repositories
- [ ] Développer les services métier
- [ ] Créer les contrôleurs REST
- [ ] Configurer Spring Security + JWT
- [ ] Intégrer Spring AI
- [ ] Développer le frontend Angular
- [ ] Implémenter la gamification
- [ ] Ajouter la modération de contenu
- [ ] Tests et déploiement

---

## 👥 Auteurs

- **Kawtar Shaimi** - *Développeuse* - [@Kawtar-Shaimi](https://github.com/Kawtar-Shaimi)

---

## 📄 License

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 📞 Contact

Pour toute question ou suggestion :
- **GitHub** : [@Kawtar-Shaimi](https://github.com/Kawtar-Shaimi)
- **Email** : [votre-email@example.com](mailto:votre-email@example.com)

---

## 🙏 Remerciements

- Spring Boot Team
- Angular Team
- Communauté Open Source

---

<div align="center">
  <p>Fait avec ❤️ par Kawtar Shaimi</p>
  <p>⭐ N'oubliez pas de mettre une étoile si ce projet vous plaît !</p>
</div>
