# RAPPORT TECHNIQUE DE PROJET
# AIESEC FINANCE HUB — SYSTÈME DE GESTION FINANCIÈRE D'ÉVÉNEMENTS
**Filière / Module :** MERN Stack (MongoDB, Express.js, React.js, Node.js)  
**Étudiante :** Dridi Nada  
**Établissement :** École Polytechnique de Sousse  

---

## 1. INTRODUCTION & OBJECTIFS DU PROJET

L'organisation internationale **AIESEC** orchestre chaque année de multiples événements (Global Villages, Forums d'entreprises / Career Fairs, Conférences de leadership nationales, Campagnes de recrutement).

Chaque événement engendre des flux financiers bilatéraux :
- **Revenus :** Sponsoring, Vente de billets (billetterie), Frais d'inscription (registration fees), Frais de stands (booths), Dons.
- **Dépenses :** Location de salle / espace, Marketing & communication, Restauration (catering), Décoration & logistique, Transport, Équipements techniques.

**Objectif applicatif :** Développer une solution SaaS complète, intuitive, réactive et sécurisée avec la stack MERN, permettant de centraliser la gestion des événements, d'enregistrer et catégoriser chaque transaction financière, et de calculer dynamiquement la santé financière globale et individuelle via un tableau de bord analytique.

---

## 2. ARCHITECTURE TECHNIQUE & CHOIX TECHNOLOGIQUES

Le projet respecte scrupuleusement l'architecture MERN standard en JavaScript pur (sans complexité Superflue ou TypeScript) :

```
                  +-----------------------------------+
                  |         Client React 18           |
                  |  Vite, React Router v6, Recharts  |
                  +-----------------+-----------------+
                                    |
                         Axios + JWT Bearer Token
                                    |
                                    v
                  +-----------------+-----------------+
                  |       Serveur Express.js          |
                  |     Node.js, bcryptjs, JWT        |
                  +-----------------+-----------------+
                                    |
                           Mongoose ODM
                                    |
                                    v
                  +-----------------+-----------------+
                  |      MongoDB Atlas (Cloud)        |
                  |   Users, Events, Categories, Tx   |
                  +-----------------------------------+
```

### Pourquoi ces technologies ?
1. **Node.js & Express.js :** Moteur d'exécution asynchrone non-bloquant et framework REST minimaliste et performant pour distribuer des API JSON.
2. **MongoDB Atlas & Mongoose :** Base de données orientée documents NoSQL hébergée sur le cloud. Mongoose apporte la validation stricte des schémas, les hooks pré-enregistrement (`pre('save')`) et les relations de population (`.populate()`).
3. **React 18 & Vite :** Vite offre un rechargement à chaud ultra-rapide et un bundling optimisé. React permet une gestion déclarative de l'interface via des composants réutilisables et des hooks (`useState`, `useEffect`, `useContext`).
4. **JWT & bcryptjs :** Hachage unidirectionnel des mots de passe (10 tours de salage) et jetons d'accès signés avec expiration pour une authentification stateless sans sessions serveur lourdes.
5. **Recharts :** Bibliothèque déclarative basée sur SVG et React pour générer le graphique de comparaison Revenus vs Dépenses par événement.

---

## 3. MODÈLES DE DONNÉES & RELATIONS MONGOOSE

Quatre collections interconnectées par des références `ObjectId` :

### 3.1 Modèle `User` (`server/models/User.js`)
- `name` (String, requis)
- `email` (String, requis, unique, minuscule, trim)
- `password` (String, requis, min. 6 caractères) — haché via bcrypt dans le middleware Mongoose `pre('save')`.
- Méthode d'instance `matchPassword(enteredPassword)` utilisant `bcrypt.compare`.

### 3.2 Modèle `Event` (`server/models/Event.js`)
- `name` (String, requis)
- `description` (String)
- `location` (String, requis)
- `startDate` (Date, requis)
- `endDate` (Date, requis)
- `budget` (Number, requis, >= 0)
- `createdBy` (ObjectId, référence `User`, requis)

### 3.3 Modèle `Category` (`server/models/Category.js`)
- `name` (String, requis)
- `type` (String, enum: `['revenue', 'expense']`, requis)
- Index composé unique `{ name: 1, type: 1 }` pour empêcher les doublons.

### 3.4 Modèle `Transaction` (`server/models/Transaction.js`)
- Un modèle unique pour les recettes et les dépenses (Section 3.3 du cahier des charges).
- `event` (ObjectId, référence `Event`, requis)
- `category` (ObjectId, référence `Category`, requis)
- `type` (String, enum: `['revenue', 'expense']`, requis)
- `description` (String, requis)
- `amount` (Number, requis, > 0)
- `date` (Date, requis, défaut: Date courante)
- `createdBy` (ObjectId, référence `User`, requis)

### 3.5 Relations One-to-Many & Intégrité Référentielle
- **1 Utilisateur -> N Événements :** L'utilisateur est lié via `createdBy`.
- **1 Événement -> N Transactions :** Chaque transaction référence son événement. Lors de la suppression d'un événement, une cascade automatique (`Transaction.deleteMany({ event: id })`) élimine tout risque d'enregistrement orphelin.
- **1 Catégorie -> N Transactions :** La suppression d'une catégorie est protégée par un contrôle d'intégrité : si des transactions y sont rattachées, l'API renvoie un code `400 Bad Request` explicatif empêchant la destruction des données.

---

## 4. LOGIQUE MÉTIER & CALCULS FINANCIERS DYNAMIQUES

Aucune valeur financière n'est codée en dur dans le tableau de bord :
1. **Total Revenus :** `Somme(transactions de type 'revenue')`
2. **Total Dépenses :** `Somme(transactions de type 'expense')`
3. **Solde Net (Net Balance) :** `Total Revenus - Total Dépenses`
   - Si `Solde Net >= 0` -> Statut financier **Positif / Excédentaire** (Badge vert `#16A879`).
   - Si `Solde Net < 0` -> Statut financier **Déficitaire** (Badge rouge `#E45B65`).
   - Si aucune transaction -> Badge neutre **Aucune transaction**.

---

## 5. PAGES DU FRONTEND & EXPÉRIENCE UTILISATEUR

Conformément à la charte AIESEC (minimaliste, bleue `#0077FF` / `#003B70`, claire et aérée) :

| Page | Route | Description & Composants |
|---|---|---|
| **Page 1 : Landing Page** | `/` | Page d'accueil publique avec barre de recherche, slogan officiel, bouton "Get Started" et visuel interactif avec cartes flottantes de KPIs. |
| **Page 2 : Connexion** | `/login` | Formulaire avec validation, persistance du token JWT dans `localStorage`. |
| **Page 3 : Inscription** | `/register` | Inscription avec confirmation de mot de passe et hachage sécurisé. |
| **Page 4 : Dashboard** | `/dashboard` | 4 cartes KPI dynamiques, graphique Recharts Revenus vs Dépenses, tableau comparatif des événements et flux des transactions récentes. |
| **Page 5 : Événements** | `/events` | Grille de cartes d'événements, recherche en temps réel, modale d'ajout d'événement et suppression sécurisée. |
| **Page 6 : Détails Événement** | `/events/:id` | Bilan financier de l'événement, boutons rapides `+ Add Revenue` et `+ Add Expense` avec modale contextuelle, et liste détaillée des transactions. |
| **Page 7 : Transactions** | `/transactions` | Tableau filtrable par événement et par type (`revenue` / `expense`), calcul instantané du sous-total, et modale d'enregistrement. |
| **Page 8 : Catégories** | `/categories` | Affichage séparé des catégories de recettes et dépenses, ajout dynamique et suppression sécurisée avec vérification d'utilisation. |

---

## 6. SÉCURITÉ & BONNES PRATIQUES

- **Hachage bcrypt :** Les mots de passe en clair ne sont jamais enregistrés en base.
- **Middleware `protect` :** Vérifie la signature du JWT avant chaque opération de création, lecture protégée ou suppression.
- **Intercepteur Axios :** Injecte systématiquement le Bearer token sans répéter le code dans les composants.
- **Variables d'environnement :** Toutes les données sensibles (`MONGO_URI`, `JWT_SECRET`, ports) sont isolées dans `.env` et exclues du versionnement Git (`.gitignore`).
- **Protection CORS :** Configuration explicite limitant les origines autorisées en production.

---

## 7. SCÉNARIO DE DÉMONSTRATION (TESTS DE VALIDATION)

Le script de semence automatique (`npm run seed`) injecte le scénario type du cahier des charges :

- **Événement :** `Global Village 2026` (Budget : 5 000 TND)
  - **Revenus (6 000 TND) :**
    - Sponsoring : 3 000 TND
    - Billetterie : 2 000 TND
    - Frais de stands : 1 000 TND
  - **Dépenses (2 000 TND) :**
    - Location de salle : 1 200 TND
    - Décoration : 500 TND
    - Marketing : 300 TND
  - **Résultat attendu :**
    - Total Revenus = `6 000.00 TND`
    - Total Dépenses = `2 000.00 TND`
    - Solde Net = `+4 000.00 TND` (Excédent positif)

Deux autres événements (`Career Fair 2026` avec solde de +2 500 TND et `Leadership Conference 2026` avec un déficit de -500 TND) démontrent la robustesse du comparateur multi-événements sur le graphique Recharts.

---

## 8. DÉPLOIEMENT CLOUD

1. **Base de données :** MongoDB Atlas Cluster M0 (Cloud AWS, connexion chiffrée SSL).
2. **Backend API :** Déployable sur Render via le fichier `render.yaml` inclus.
3. **Frontend Client :** Déployable sur Vercel avec le fichier `client/vercel.json` gérant la réécriture SPA.
