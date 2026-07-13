# Student Life — Frontend

Student Life is a web app that helps students track assignments, plan study time, manage their
class schedule, and chat with group members — all in one place. This repo is the Vue 3 +
TypeScript frontend; it talks to a separate backend API for authentication and assignment data.

## Tech Stack

- [Vue 3](https://vuejs.org/) with `<script setup>` SFCs
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) — dev server & build
- [Pinia](https://pinia.vuejs.org/) with `pinia-plugin-persistedstate` for state management
- [Vue Router](https://router.vuejs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Axios](https://axios-http.com/) for API requests
- [lucide-vue-next](https://lucide.dev/) for icons

## Getting Started

### Prerequisites

- Node.js and npm

### Setup

```bash
npm install
```

Create a `.env` file in the project root to point the app at your API:

```
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

If unset, requests fall back to `/api` (see `src/api/client.ts`).

### Development

```bash
npm run dev
```

Open the printed local URL, register or log in, and you'll land on the dashboard.

### Type-check & build

```bash
npm run build
```

Runs `vue-tsc -b` for type-checking, then `vite build` for the production bundle.

### Preview a production build

```bash
npm run preview
```

## Features

### Available now

- **Auth** — register, log in, and log out against the real backend. Session is derived from the
  JWT returned on login and persisted locally, so a refresh keeps you signed in.
- **Assignments** — the most complete feature, fully wired to the backend:
  - Create, edit, and track assignments with a checklist of tasks per assignment.
  - Drag-and-drop task reordering.
  - Invite teammates to an assignment by email.
  - An AI-assisted study planner that breaks an assignment into a day-by-day plan based on its
    due date.
  - Progress and stats views (completion %, upcoming deadlines, etc).
- **Schedules** — a full calendar (month/day views, event creation, drag-to-create, reminders).
  Events are stored locally in the browser (localStorage via Pinia), not yet synced to the
  backend, so they won't follow you across devices.
- **Group chat** — conversation list, threaded messages grouped by sender, typing/online
  indicators, and a message composer. Currently runs on seeded mock data in the frontend
  (`src/features/groups/data.ts`) rather than a live chat backend.
- **Dashboard** — landing page pulling together assignment progress, today's schedule, deadlines,
  and group activity into one overview. Currently shows static/prototype figures rather than
  each feature's real data.

### Under development

- **Notifications** — placeholder page only; the store exists (designed to be server-driven) but
  isn't wired up to a real feed yet.
- **Settings** — placeholder page; no settings are implemented yet.
- **Users** — placeholder page; no user management/directory implemented yet.
- **Schedules and Group chat backend sync** — both features are fully usable today but run on
  local/mock data instead of the backend; wiring them up to persistent, shared data is planned.

## Project Structure

```
src/
├── api/                 # Shared Axios client + interceptors
├── app/
│   ├── layouts/          # DefaultLayout (authenticated shell) and AuthLayout
│   ├── plugins/          # Pinia + persistence setup
│   ├── providers/        # App-wide provider wiring
│   ├── router/           # Route table (composed from each feature's routes.ts)
│   └── stores/           # App-level UI state (e.g. theme)
├── features/             # One folder per domain feature
│   ├── assignments/      # Assignments, tasks, AI study planner
│   ├── auth/              # Login / register / session
│   ├── dashboard/         # Landing/overview page
│   ├── groups/             # Group chat
│   ├── notifications/
│   ├── schedules/          # Calendar & event scheduling
│   ├── settings/
│   └── users/
└── shared/                # Cross-feature composables, components, types, utils
```

Each feature typically follows this internal layout:

```
features/<name>/
├── api/            # Request functions that call the shared Axios client
├── components/     # Feature-scoped Vue components
├── composables/     # Feature-scoped reactive logic
├── store/            # Pinia store split into action / reducer / public store
├── types/
├── routes.ts
└── views/           # Route-level page components
```

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (disable Vetur if installed).

See the [Vue TypeScript guide](https://vuejs.org/guide/typescript/overview.html#project-setup) for `.vue` type-checking setup in your editor.
