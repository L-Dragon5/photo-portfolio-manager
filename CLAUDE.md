# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Frontend
```bash
npm run dev      # Start Vite dev server (hot reload)
npm run build    # Build frontend assets for production
npm run lint     # Lint and format JS/JSX with Biome
```

### Backend
```bash
php artisan serve          # Start Laravel dev server
php artisan migrate        # Run database migrations
php artisan tinker         # Interactive Laravel shell
composer install           # Install PHP dependencies
```

### Testing
```bash
./vendor/bin/pest          # Run all tests
./vendor/bin/pest --filter="TestName"  # Run a single test
```

### Code Quality
```bash
./vendor/bin/pint          # Check/fix PHP code style (Laravel Pint)
./vendor/bin/rector process  # Auto-refactor PHP with Rector
```

### Deployment
```bash
fly deploy  # Deploy to Fly.io
```

## Architecture

**Stack:** Laravel 12 (PHP 8.4) + React 18 + Inertia.js + Chakra UI 2, deployed on Fly.io via Docker with SQLite (metadata) and AWS S3 (media).

### How Inertia.js Works Here
Laravel handles all routing (`routes/web.php`). Controllers return `Inertia::render('Public/Album', $data)` instead of Blade views. React page components in `resources/js/Pages/` receive Laravel data as props. There is no separate API for page navigation — Inertia intercepts link clicks and makes XHR requests that return JSON page data.

### Data Model
- **Album** — core entity, belongs to an Event, has many Photos via Spatie Media Library, many-to-many with Cosplayers
- **Photo** — extends Spatie's `Media` model (stored on S3), has responsive image conversions at 300/600/1280/1920px
- **Event** — groups albums by photography event
- **Cosplayer** — tagged on albums with character names (many-to-many via `albums_cosplayers`)
- **FeaturedPhoto** — tracks which photos appear on the homepage

### Media Handling
Spatie Media Library (`spatie/laravel-medialibrary`) manages all image storage. The custom `PhotoWidthCalculator` class drives responsive image srcset generation. Production media goes to S3; local dev uses local disk. The custom media model is `App\Models\Photo`.

### Auth
Admin routes use HTTP Basic Auth (`auth.basic` middleware). No session-based login — credentials come from the `users` table directly. Public routes have no auth, except the culling feature which uses a per-album password in the URL.

### Route Structure
- `GET /` — featured photos homepage
- `GET /events`, `/events/{id}` — event listings and detail
- `GET /on-location`, `/press` — album category pages
- `GET /culling/{password}` — password-protected photo selection for clients
- `/admin/*` — all admin CRUD (basic auth required)
- `/api/admin/cosplayers` — only API route (basic auth)

### Frontend Layout
Two layout trees:
- `AdminLayout.jsx` → `AdminSidebarNav.jsx` — admin panel
- `BaseLayout.jsx` → `SidebarNav.jsx` — public site

Inertia page components are in `resources/js/Pages/Public/` and `resources/js/Pages/Admin/`. Chakra UI is the component library — use its components rather than HTML elements or custom CSS where possible.

### Key Config Files
- `config/media-library.php` — S3 disk, custom Photo model, responsive image widths
- `config/database.php` — SQLite for both local and production
- `fly.toml` — Fly.io region (iad), VM size (1 CPU / 1GB RAM), volume mount for storage
- `biome.json` — JS linting/formatting rules
- `vite.config.js` — Laravel Vite plugin config
