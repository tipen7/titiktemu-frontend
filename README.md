This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

# TitikTemu Frontend

TitikTemu is a modular mapping and decision-support frontend for connecting public-sector policy, business ESG activity, and consumer discovery in one spatial interface.

The frontend is built with the Next.js App Router. The repository contains the application shell and typed module boundaries so feature work can be developed independently within clear ownership boundaries.

## Technology

- Next.js 16 and React 19
- TypeScript with strict checking
- Tailwind CSS 4 and PostCSS
- Leaflet and React Leaflet for maps
- Chart.js and React Chart.js 2 for data visualizations
- TanStack Query for server-state fetching and caching
- Zustand for client-side session and role state
- Supabase for authentication and backend services
- pnpm for dependency management

## Requirements

- Node.js 20 or newer
- pnpm 10.15.0 or a compatible pnpm 10 release

Check your local versions before installing dependencies:

```bash
node --version
pnpm --version
```

## Getting Started

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Create a local environment file from the template.

   PowerShell:

   ```powershell
   Copy-Item .env.example .env.local
   ```

   macOS/Linux:

   ```bash
   cp .env.example .env.local
   ```

3. Fill in `.env.local` for Supabase, the backend API, and the MAPID Maps integration.

4. Start the development server:

   ```bash
   pnpm dev
   ```

Open [http://localhost:3000](http://localhost:3000) in a browser. Next.js reloads the page as files change.

## Available Commands

| Command      | Purpose                                           |
| ------------ | ------------------------------------------------- |
| `pnpm dev`   | Start the local Next.js development server        |
| `pnpm lint`  | Run ESLint across the project                     |
| `pnpm build` | Create a production build and run type validation |
| `pnpm start` | Serve the most recent production build            |

Run `pnpm lint` before opening a pull request. Run `pnpm build` when changing routing, data contracts, or shared configuration.

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

| Variable                         | Responsibility                      |
| -------------------------------- | ----------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`       | Supabase project URL                |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | Supabase browser-safe anonymous key |
| `NEXT_PUBLIC_API_URL`            | Backend API gateway URL             |
| `NEXT_PUBLIC_MAPID_MAPS_API_KEY` | MAPID Maps basemap integration key  |

Only browser-safe values should use the `NEXT_PUBLIC_` prefix. Never commit `.env.local`, access tokens, service-role keys, or other secrets.

## Application Structure

The project intentionally keeps the working code under the root `app/` directory. This is the Next.js App Router root and should not be replaced with a second `src/` tree.

```text
app/
├── layout.tsx                 # Shared document shell, fonts, and metadata
├── page.tsx                   # Root route
├── globals.css                # Global styles and Tailwind layers
├── components/
│   ├── map/                   # Leaflet map, GeoJSON layers, and map controls
│   ├── charts/                # Chart.js visualization wrappers
│   └── modules/               # Product-facing vertical modules
│       ├── ai-panel/          # In-map AI interaction surface
│       ├── discovery-tracker/ # B2C discovery flow and geolocation UI
│       ├── esg-tenant-hub/    # B2B ESG tenant workspace
│       └── policy-simulator/  # B2G policy what-if experience
├── hooks/                     # TanStack Query hooks grouped by data domain
├── lib/                       # API, Supabase, and query-client infrastructure
├── store/                     # Zustand client state, session, and RBAC role
└── types/                     # Shared TypeScript and GeoJSON contracts
```

### Folder Responsibilities

#### `app/`

Owns routes and shared App Router concerns. Keep route composition here and reusable business or visual logic in `components/`.

#### `app/components/map/`

Contains the Leaflet boundary. Map setup, GeoJSON rendering, layers, and map controls belong here so browser-only map behavior stays isolated from server components.

#### `app/components/charts/`

Contains small Chart.js wrappers such as radar and histogram visualizations. Components should receive typed data and avoid fetching directly.

#### `app/components/modules/`

Contains user-facing product modules. Each module owns its presentation and workflow while using shared map, chart, hook, store, and type utilities.

#### `app/hooks/`

Contains one TanStack Query hook per data domain, such as grid, UMKM, and policy data. Hooks define query keys, request behavior, loading states, and cache usage.

#### `app/lib/`

Contains infrastructure shared by the application: the API fetch wrapper, Supabase client, and Query Client configuration. Keep domain-specific UI out of this layer.

#### `app/store/`

Contains client state that should not be treated as server data, including the authenticated session and RBAC role. Keep remote collections in TanStack Query instead.

#### `app/types/`

Contains shared contracts used across modules and data boundaries. Keep GeoJSON and API-facing types here to prevent duplicated shapes.

## Development Guidelines

- Prefer small, focused components with explicit TypeScript props.
- Keep data fetching in domain hooks and keep visualization components presentational.
- Use TanStack Query for server state and Zustand only for local client state.
- Isolate browser-only APIs such as Leaflet and geolocation behind client components.
- Extend shared types before duplicating interfaces inside a feature module.
- Keep public environment variables limited to values that are safe in browser bundles.
- Add or update focused validation when changing shared hooks, types, or API behavior.
- Preserve the existing root `app/` layout and naming conventions.

## Contribution Workflow

1. Create a focused branch for the change.
2. Make the smallest coherent change in the owning folder.
3. Run `pnpm lint` and any relevant local checks.
4. Run `pnpm build` for route, type, or configuration changes.
5. Open a pull request describing the user-visible behavior, validation performed, and any environment setup required.

Keep commits focused and avoid committing generated output, local environment files, editor state, or build artifacts.

## Useful References

- [Next.js App Router documentation](https://nextjs.org/docs/app)
- [React Leaflet documentation](https://react-leaflet.js.org/)
- [Chart.js documentation](https://www.chartjs.org/docs/latest/)
- [TanStack Query documentation](https://tanstack.com/query/latest)
- [Zustand documentation](https://zustand.docs.pmnd.rs/)
- [Supabase JavaScript documentation](https://supabase.com/docs/reference/javascript/introduction)
