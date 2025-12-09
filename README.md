# Vietbando Workflow (Frontend)

Web UI for Vietbando’s workflow platform: design BPMN diagrams, build dynamic forms, manage models/instances/tasks/schedules, and administer users/groups.

## Tech Stack
- React 18, TypeScript, Vite 5
- Material UI, Framer Motion for UI/UX
- React Router 7 for protected routing
- @tanstack/react-query for data fetching/caching
- BPMN stack: `bpmn-js`, `bpmn-js-properties-panel`, `camunda-bpmn-js-behaviors`, `bpmn-auto-layout`
- Forms: `@bpmn-io/form-js`, `react-hook-form` (via `@hookform/resolvers`)
- i18next for localization, React Toastify for notifications

## Key Features
- Login or token-based login; role checks for admin/super admin.
- Home page with quick navigation cards.
- **Design**: BPMN designer plus dynamic form builder.
- **Models**: manage model info, permissions, and metadata.
- **Instances**: view/manage instances (includes public view).
- **Tasks**: personal task list and handling.
- **Schedules**: schedule and track model timelines.
- **Management**: administer users, groups, model types, categories.
- Theme & language switching, version badge, toasts, loading spinner.
- Mock backend for local/demo use (`src/services/mockBackend.ts`, sample data in `src/mockData`).

## Directory Overview
- `src/components/pages`: main pages (Design, Tasks, Models, Instances, Schedules, Management, Login, …).
- `src/components/common`: reusable components (BpmnEditor, FormBuilder, dialogs, toasts, …).
- `src/contexts`: app and language contexts.
- `src/services`: API calls and mock backend.
- `src/mockData`: demo/dev mock data.
- `src/bpmnProvider`: BPMN helpers/extensions (defines, plugins).
- `public/env/config.js`: runtime config (API, security, version).

## Prerequisites
- Node.js ≥ 18
- npm (bundled with Node)

## Configuration
Edit `public/env/config.js`:
- `API_BASE_URL`: your backend URL.
- `SECURE_FLAG`: set `true` if backend requires HTTPS/secure cookies.
- `VERSION`: displayed as a badge in the UI.

## Setup & Commands
```bash
npm install
npm run dev        # dev server at http://localhost:5173
npm run build      # production build to dist
npm run preview    # serve the build locally
npm run lint       # lint check
```

## Deployment
- SPA build; deploy the `dist` output to any static host (Vercel, Nginx, S3/CloudFront, …).
- Vercel config is provided via `vercel.json`.

## Development Notes
- Routes are protected via `GeneralProtectedRoute`.
- i18n is enabled; add/update languages under `src/i18n`.
- For offline/demo mode, use the mock backend (`src/services/mockBackend.ts`) and sample data in `src/mockData`.
