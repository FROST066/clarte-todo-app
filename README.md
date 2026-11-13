<div align="center">

# ✨ Clarté

### Le gestionnaire de tâches épuré, codé à 100 % par un agent IA

**Né au [DevFest Marseille 2026](https://gdg.community.dev/events/details/google-gdg-marseille-presents-devfest-marseille-2026/) · Entièrement développé avec [Google Antigravity](https://antigravity.google/)**

[![DevFest Marseille 2026](https://img.shields.io/badge/DevFest-Marseille%202026-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://gdg.community.dev/events/details/google-gdg-marseille-presents-devfest-marseille-2026/)
[![Built with Antigravity](https://img.shields.io/badge/Built%20with-Antigravity-8E44AD?style=for-the-badge&logo=google&logoColor=white)](https://antigravity-code-lab-ab3bc7.gitlab.io/fr/bonus/03-antigravity-cli/)

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![Tests](https://img.shields.io/badge/tests-36%20passing-2EA44F?logo=node.js&logoColor=white)
![Cloud Run](https://img.shields.io/badge/Deploy-Cloud%20Run-4285F4?logo=googlecloud&logoColor=white)
![a11y](https://img.shields.io/badge/a11y-WCAG%202.1%20AA-005A9C)

</div>

---

## 📖 L'histoire du projet

**Clarté** est né lors du **[DevFest Marseille 2026](https://gdg.community.dev/events/details/google-gdg-marseille-presents-devfest-marseille-2026/)**, organisé par le **GDG Marseille**.

Le défi : construire une application web complète **sans écrire une seule ligne de code à la main**. Tout le code de ce dépôt (le front React, l'API Express, les tests, le Dockerfile et les améliorations d'accessibilité) a été produit par **[Google Antigravity](https://antigravity.google/)**, la plateforme de développement pilotée par des agents IA, en suivant le codelab :

> 🧪 **[Codelab Antigravity : Antigravity CLI (bonus 03)](https://antigravity-code-lab-ab3bc7.gitlab.io/fr/bonus/03-antigravity-cli/)**

Le rôle du développeur ? **Décrire, guider, relire et valider.** L'agent s'est chargé du reste.

## 🎯 Fonctionnalités

| | Fonctionnalité | Détail |
|---|---|---|
| ➕ | **Création rapide** | Titre, description, priorité, catégorie et date d'échéance. Les titres vides sont refusés côté client et côté serveur |
| 🚦 | **3 niveaux de priorité** | 🔴 Haute · 🟠 Moyenne · 🟢 Basse |
| 🧭 | **Deux vues** | Liste classique et **matrice de priorités** en colonnes |
| 🔎 | **Recherche instantanée** | Avec surlignage des termes trouvés |
| 🎛️ | **Filtres et tri** | Par statut (toutes / actives / terminées), par priorité, par date ou par titre |
| ✏️ | **Édition en ligne** | Modifier, dupliquer, cocher, supprimer (avec confirmation) |
| ⚡ | **Actions groupées** | Tout cocher, supprimer les terminées, réinitialiser |
| 📊 | **Statistiques en temps réel** | Progression et compteurs |
| 🌗 | **Thème clair / sombre** | Préférence mémorisée |
| ♿ | **Accessibilité** | Sémantique, ARIA et navigation clavier (WCAG 2.1 AA) |
| 💾 | **Persistance serveur** | API REST Express avec stockage JSON |

## 🏗️ Architecture

```
┌──────────────────────────┐        fetch /api/*        ┌──────────────────────────┐
│   Front-end React 19     │ ─────────────────────────▶ │   API Express (Node 22)  │
│   Vite · Tailwind 4      │ ◀───────────────────────── │   server/app.js          │
│   Motion · Lucide        │          JSON              │   TaskStore → tasks.json │
└──────────────────────────┘                            └──────────────────────────┘
              ▲                                                      │
              └───────────── fichiers statiques dist/ (SPA) ◀────────┘
```

Un seul conteneur sert à la fois l'API et le front compilé, ce qui convient bien à **Google Cloud Run**.

```
clarte-todo-app/
├── src/                 # Front-end React + TypeScript
│   ├── components/      # TaskForm, TaskList, PriorityMatrixView, StatsBanner…
│   ├── hooks/           # useTasks (appels API), useTheme
│   ├── types/           # Modèle Task, priorités, filtres
│   └── utils/           # Dates, surlignage
├── server/              # API Express
│   ├── app.js           # Routes REST + fallback SPA
│   ├── store.js         # Persistance JSON
│   └── index.js         # Point d'entrée
├── test/                # 36 tests node:test (zéro dépendance)
├── .agents/             # Règles et sous-agents Antigravity (gitmoji, test-writer)
├── Dockerfile           # Build multi-étapes pour Cloud Run
└── tasks.json           # Données de départ
```

## 🚀 Démarrage rapide

**Prérequis :** Node.js 22 ou plus récent

```bash
git clone https://github.com/FROST066/clarte-todo-app.git
cd clarte-todo-app
npm install
```

```bash
npm run build   # compile le front dans dist/
npm start       # lance l'API et le front sur http://localhost:8080
```

En développement (front avec rechargement à chaud) :

```bash
npm start          # terminal 1 : API sur :8080
npm run dev        # terminal 2 : Vite sur :3000
```

### Scripts disponibles

| Commande | Rôle |
|---|---|
| `npm start` | Démarre le serveur Express (API + front compilé) |
| `npm run dev` | Serveur de développement Vite |
| `npm run build` | Build de production du front |
| `npm test` | Lance la suite de tests `node:test` |
| `npm run lint` | Vérification des types TypeScript |

## 🔌 API REST

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/tasks?status=` | Liste des tâches (filtre optionnel `active` / `completed`) |
| `GET` | `/api/tasks/:id` | Détail d'une tâche |
| `POST` | `/api/tasks` | Créer une tâche (`title` obligatoire) |
| `PUT` | `/api/tasks/:id` | Modifier une tâche |
| `DELETE` | `/api/tasks/:id` | Supprimer une tâche |
| `DELETE` | `/api/tasks/completed` | Supprimer les tâches terminées |
| `DELETE` | `/api/tasks` | Tout supprimer |
| `POST` | `/api/tasks/toggle-all` | Cocher ou décocher toutes les tâches |
| `POST` | `/api/tasks/reset` | Restaurer les données de départ |

## 🧪 Tests

```bash
npm test
```

36 tests couvrent la lecture, la création, la modification, la suppression, les actions groupées, le store et le fallback SPA. Ils ont été écrits par le sous-agent Antigravity [`test-writer`](.agents/agents/test-writer.md) avec `node:test` et `node:assert` uniquement.

## ☁️ Déploiement sur Google Cloud Run

```bash
gcloud run deploy clarte-todo-app \
  --source . \
  --region europe-west1 \
  --allow-unauthenticated
```

> ⚠️ Sur Cloud Run, le système de fichiers est éphémère : les tâches sont réinitialisées à chaque redémarrage d'instance. Pour une persistance durable, branchez Firestore ou Cloud SQL.

## 🤖 Développé avec Antigravity

Ce projet montre ce qu'on peut faire avec un **workflow agentique** :

- 🧠 **Agent principal** : génère les fonctionnalités à partir de prompts en langage naturel
- 🧪 **Sous-agent `test-writer`** : écrit et exécute les tests de l'API
- 📏 **Règles projet** ([`.agents/rules/gitmoji.md`](.agents/rules/gitmoji.md)) : impose des commits au format [gitmoji](https://gitmoji.dev/)
- 🐳 **Déploiement** : Dockerfile multi-étapes généré pour Cloud Run
- ♿ **Audit a11y** : passe d'accessibilité WCAG 2.1 AA réalisée par l'agent

👉 Pour reproduire l'expérience : **[le codelab Antigravity](https://antigravity-code-lab-ab3bc7.gitlab.io/fr/bonus/03-antigravity-cli/)**

## 🙏 Remerciements

- Le **[GDG Marseille](https://gdg.community.dev/)** et toute l'équipe du **DevFest Marseille 2026**
- Les auteurs du **codelab Antigravity**
- **Google** pour Antigravity et Cloud Run

---

<div align="center">

Fait avec ❤️ à Marseille, et quelques prompts bien placés.

⭐ **Si ce projet vous a plu, laissez une étoile !** ⭐

</div>
