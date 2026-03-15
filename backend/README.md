# Outfitera Backend - Spring Boot

Backend API REST pour la plateforme Outfitera avec essayage virtuel par IA.

## Prérequis

- Java 17 ou supérieur
- Maven 3.6+
- PostgreSQL 13+

## Installation

### 1. Créer la base de données

```bash
createdb outfitera_db
```

Ou via psql :
```sql
CREATE DATABASE outfitera_db;
```

### 2. Configurer l'application

Éditer `src/main/resources/application.properties` :

```properties
spring.datasource.username=ton_user_postgres
spring.datasource.password=ton_password
```

### 3. Configurer les APIs IA

Obtenir les tokens pour les APIs :
- Replicate (IDM-VTON) : https://replicate.com/account
- FASHN AI : https://fashn.ai

Ajouter dans `application.properties` :
```properties
replicate.api.token=r8_xxxxxxxxx
fashn.api.key=fa-xxxxxxxxx
```

### 4. Lancer l'application

```bash
cd backend
mvn spring-boot:run
```

L'API sera accessible sur http://localhost:8080

## Architecture

```
com.fitmeai/
├── config/              # Configuration (Security, CORS)
├── controller/          # Controllers REST
├── service/             # Logique métier
├── repository/          # Accès données (JPA)
├── model/               # Entités JPA
├── dto/                 # DTOs
├── security/            # JWT, UserDetails
├── ai/                  # Service IA (IDM-VTON + FASHN)
└── exception/           # Gestion erreurs
```

## Endpoints principaux

### Auth
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion (retourne JWT)

### Clothing
- `GET /api/clothing` - Liste tous les vêtements
- `GET /api/clothing/{id}` - Détails d'un vêtement
- `GET /api/clothing/category/{category}` - Par catégorie

### Virtual Try-On
- `POST /api/tryon/test/idm-vton` - Essayage avec IDM-VTON
- `POST /api/tryon/test/fashn` - Essayage avec FASHN AI
- `GET /api/tryon/my-results` - Mes essayages (authentifié)
- `GET /api/tryon/public` - Galerie publique

## Technologies

- **Spring Boot 3.2.2**
- **Spring Security** + JWT
- **Spring Data JPA** + PostgreSQL
- **IDM-VTON** (Replicate API)
- **FASHN AI** (API)
- **Lombok**

## Parties à implémenter

Les fichiers suivants sont préparés mais nécessitent implémentation :

- [ ] Gestion panier (Cart model, service, controller)
- [ ] Système de commande (Order model, service, controller)
- [ ] Paiement (Payment service, intégration Stripe/PayPal)
- [ ] Notifications (Notification model, service)
- [ ] Modération galerie publique (Admin endpoints)
- [ ] Système d'avis et notes (Review model, service)

Voir les TODOs dans le code et le fichier `TODO.md` à la racine du projet.
