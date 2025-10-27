# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tech Stack

SvelteKit (Svelte v5) web application deployed to Cloudflare Pages/Workers with:

- **CMS**: Directus (main app data via `API_BASE_URL`)
- **Blog API**: Direct TursoDB access using `@libsql/client` (via `TRS_DATABASE_URL` and `TRS_AUTH_TOKEN`)
- **Auth**: Supabase OAuth and session management
- **Database**: Cloudflare D1 for persistence
- **Adapter**: `@sveltejs/adapter-cloudflare`
- **Rendering**: **SSR-first** - Most pages are server-rendered only (`csr: false`), client-side JavaScript only where needed

## Development Commands

```bash
# Install dependencies (uses pnpm lock)
pnpm install

# Start dev server
npm run dev
# or open browser automatically
npm run dev -- --open

# Type checking
npm run check                 # One-time check
npm run check:watch           # Watch mode

# Linting & formatting
npm run lint                  # Check with prettier + eslint
npm run format                # Auto-format with prettier

# Testing
npm run test                  # Run unit tests with Vitest

# Build & deploy
npm run build                 # Creates .svelte-kit/cloudflare
npm run preview               # Preview production build
npm run deploy                # Build + deploy to Cloudflare Pages

# Cloudflare D1 database
npm run d1:create             # Create D1 database
npm run d1:migrate:local      # Apply migrations locally
npm run d1:migrate:remote     # Apply migrations to remote
npm run d1:console:local      # Execute commands on local DB
npm run d1:console:remote     # Execute commands on remote DB
```

## Architecture Overview

### SSR-First Rendering Strategy

**Philosophy**: Minimize client-side JavaScript data serialization in HTML. Most pages are server-rendered only.

**Pages with CSR Disabled** (`export const csr = false`):

- `/` - Home page
- `/blog/**` - All blog pages
- `/courses` - Course catalog
- `/categories/**` - Category pages
- `/about`, `/faq`, `/privacy`, `/terms` - Static pages

**Pages with CSR Enabled** (`export const csr = true`):

- `/courses/[slug]` - Course detail (enrollment button, content accordion)
- `/learning/[slug]` - **Lesson reading & progress tracking** (primary interactive feature)
- `/my-courses` - User's enrolled courses
- `/profile` - User profile management

**Benefits**:

- ✅ Minimal data exposed in HTML source
- ✅ Faster initial page load
- ✅ Better SEO
- ✅ Reduced JavaScript bundle size
- ✅ Progressive enhancement

**When adding new pages**:

- Default: `export const csr = false` (SSR only)
- Only enable CSR if page needs client-side interactivity (forms with real-time validation, progress tracking, dynamic updates)

### Authentication Flow

**Server-side hooks** (`src/hooks.server.ts`):

1. Validates `jadihebat_auth` (access token) cookie on every request
2. If token invalid but `jadihebat_refresh` exists, attempts refresh via `/auth/refresh`
3. Sets `locals.user` and `locals.authToken` for use in load functions and endpoints
4. Protects routes: redirects unauthenticated users from `/learning`, `/profile`, `/my-courses`, `/settings`, `/dashboard` to `/login?redirect=...`
5. Redirects authenticated users away from `/login`, `/register`, `/forgot-password`

**Cookies used**:

- `jadihebat_auth` - Access token (30 min TTL, httpOnly)
- `jadihebat_refresh` - Refresh token (30 day TTL, httpOnly)
- `jadihebat_user` - Stringified user object (email, id, first_name, last_name, httpOnly: false for client access)

**Session Duration Configuration**:

- Access Token TTL must be synchronized between Directus settings and cookie maxAge in code
- Refresh Token TTL must match in both Directus and code (`login/+page.server.ts`, `hooks.server.ts`)
- Current: 30 min access / 30 day refresh (industry standard for eLearning platforms)

**Authentication is 100% server-side**:

- Login: `src/routes/login/+page.server.ts` - Form action calls Directus auth, sets httpOnly cookies
- Register: `src/routes/register/+page.server.ts` - Creates user via Directus admin SDK
- Logout: `src/routes/logout/+server.ts` - Clears cookies and invalidates Directus token
- Token Refresh: `src/hooks.server.ts` - Automatic refresh before requests
- No client-side auth code (Supabase client in `src/lib/auth/` exists but is server-side import only)

**Locals interface** (`src/app.d.ts`):

```typescript
interface Locals {
	user: { id: string; email: string; first_name: string; last_name: string } | null;
	authToken: string | null;
}
```

### Data Flow Pattern

**IMPORTANT SECURITY PRINCIPLE**: All authentication and external API calls MUST be server-side only.

**Client → Server API → Directus** (Correct Pattern):

1. Client-side services (`src/lib/services/*.ts`) call **local** API endpoints (e.g., `/api/enrollments/enroll`)
2. Server endpoints (`src/routes/api/**/+server.ts`) validate auth via `locals.user`
3. Server uses Directus SDK wrappers (`src/lib/server/directus*.ts`) to interact with CMS
4. Response flows back to client

**Example**: Enrolling in a course

- Client: `enrollmentService.ts` → `POST /api/enrollments/enroll`
- Server: `src/routes/api/enrollments/enroll/+server.ts` checks `locals.user`, calls Directus
- Directus: Creates `enrollments` item, updates course enrollment count

**NEVER**:

- ❌ Make direct fetch calls from client to Directus or TursoDB
- ❌ Expose API_BASE_URL, TRS_DATABASE_URL, TRS_AUTH_TOKEN, or API_ADMIN_TOKEN to client
- ❌ Use `$env/static/public` for sensitive credentials
- ❌ Store auth tokens in localStorage (use httpOnly cookies only)

### Server-Side Data Integration

**Directus CMS** (uses `@directus/sdk`):

- `src/lib/server/directus.ts` - Main app data (courses, enrollments, lessons, progress)
- `src/lib/server/directus-admin.ts` - Admin operations

**Blog TursoDB** (uses `@libsql/client`):

- `src/lib/server/turso-blog.ts` - Blog articles with helpers: `fetchArticles()`, `fetchArticleBySlug()`, `fetchCategories()`, `getImageUrl()`, `formatDate()`, `formatArticle()`
- Direct SQL queries to TursoDB (libSQL)
- Supports filtering by category, search queries, tags, and related articles

**CRITICAL**: Never expose API tokens to client. All backend API calls must be in:

- `src/lib/server/*` files
- `src/routes/**/+server.ts` endpoints
- `src/routes/**/+page.server.ts` or `+layout.server.ts` load functions

### Environment Variables

**Server** (`$env/static/private`):

- `API_BASE_URL` - Directus main API (https://api.jadihebat.com)
- `TRS_DATABASE_URL` - TursoDB database URL (libsql://...)
- `TRS_AUTH_TOKEN` - TursoDB authentication token
- `BLOG_ASSETS_URL` - Blog assets URL (https://olcourse-api.jadihebat.workers.dev)
- `API_ADMIN_TOKEN` - Admin auth token
- `API_DEFAULT_ROLE_ID` - Default role for new users
- Supabase credentials

**Public** (`$env/static/public`):

- `PUBLIC_SITE_URL` - OAuth redirects
- `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`

**Wrangler config** (`wrangler.jsonc`): Contains convenience vars for Cloudflare deployment. Not all runtime environments read from this file. **Warning**: This file currently contains API tokens and should not be committed to public repositories in production scenarios.

## Key Directory Structure

```
src/
├── hooks.server.ts              # Auth middleware, token refresh, route protection
├── routes/
│   ├── +layout.server.ts        # Reads cookies, sets data.user/isAuthenticated
│   ├── api/                     # Server endpoints (JSON responses)
│   │   ├── enrollments/         # Enroll, check enrollment status
│   │   ├── lessons/             # Lesson-related endpoints
│   │   └── progress/            # Track lesson/course progress
│   ├── blog/                    # Blog pages (uses turso-blog.ts)
│   ├── courses/                 # Course catalog & detail pages
│   ├── learning/                # Protected: active course learning interface
│   ├── my-courses/              # Protected: user's enrolled courses
│   └── profile/                 # Protected: user profile
├── lib/
│   ├── server/                  # Server-only modules (Directus wrappers)
│   │   ├── directus.ts          # Main Directus client
│   │   ├── turso-blog.ts        # Blog TursoDB client + helpers
│   │   └── directus-admin.ts    # Admin Directus client
│   ├── auth/                    # Supabase client & auth helpers
│   │   ├── supabase.js          # Client-side Supabase instance
│   │   └── auth.js              # Auth utilities
│   ├── services/                # Client-side API wrappers (browser-only)
│   │   ├── enrollmentService.ts # Enrollment operations
│   │   └── progressService.ts   # Progress tracking
│   ├── components/              # Reusable Svelte components
│   ├── types/                   # TypeScript type definitions
│   │   ├── course.ts
│   │   └── blog.ts
│   └── utils/                   # Shared utilities
└── static/                      # Static assets
```

## Development Patterns

### Adding a Server Endpoint

1. Create `src/routes/api/[feature]/[action]/+server.ts`
2. Import `RequestHandler` from `@sveltejs/kit`
3. Check auth: `const user = event.locals.user; if (!user) return json({ error: 'Unauthorized' }, { status: 401 });`
4. Validate request params/body
5. Use appropriate Directus wrapper from `src/lib/server/`
6. Return JSON response

**Example reference**: `src/routes/api/enrollments/check/+server.ts`

### Adding a Protected Page

1. Create route under protected path (`/learning`, `/profile`, `/my-courses`, etc.)
2. Access `locals.user` in `+page.server.ts` load function
3. Hooks automatically redirect unauthenticated users

### Using Directus SDK

Prefer typed SDK methods:

```typescript
import { readItems, createItem, updateItem } from '@directus/sdk';
import { directusClient } from '$lib/server/directus';

// Read with nested fields
const courses = await directusClient.request(
	readItems('courses', {
		fields: ['id', 'title', { course_sections: ['*', { lessons: ['*'] }] }],
		filter: { status: { _eq: 'published' } }
	})
);

// Create item
await directusClient.request(
	createItem('enrollments', {
		user_id: userId,
		course_id: courseId,
		enrolled_at: new Date()
	})
);
```

### Client-Side Service Pattern

Services in `src/lib/services/` are browser-only helpers that call `/api/*` endpoints:

```typescript
// enrollmentService.ts
export async function enrollInCourse(courseId: string) {
	const response = await fetch('/api/enrollments/enroll', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ courseId })
	});
	return response.json();
}
```

Never call these from server code. They assume browser context.

### Working with Blog Data

Use helpers from `turso-blog.ts` for direct TursoDB access:

- `fetchArticles(limit?, page?)` - Get published blog posts with pagination
- `fetchArticleBySlug(slug)` - Get single blog post (auto-increments view count)
- `fetchCategories()` - Get all active blog categories
- `fetchArticlesByCategory(categorySlug, limit?, page?)` - Filter posts by category
- `searchArticles(query, limit?)` - Search posts by title/content/excerpt
- `fetchRelatedArticles(article, limit?)` - Get related posts from same category
- `fetchTags()` - Get all blog tags
- `getImageUrl(imageId)` - Convert image ID or URL to full URL
- `formatDate(dateString)` - Format dates consistently (Indonesian locale)
- `formatArticle(article)` - Transform API response to include computed fields (imageUrl, formattedDate, categories, etc.)

**Blog Data Structure** (TursoDB):

```typescript
// Direct SQL queries return BlogArticle[]
// No pagination wrapper - handled at query level with LIMIT/OFFSET
```

**Formatted Article Fields** (from `formatArticle()`):

- `imageUrl` - Full URL to cover image
- `formattedDate` - Localized date string
- `tagNames` - Array of tag names
- `categories` - Array of category objects
- `authorName` - Author display name
- `excerpt` - Article excerpt or auto-generated from content

**Example**: `src/routes/blog/+page.server.ts`

## Testing

**Test Framework**: Vitest (configured in `vitest.config.ts`)

**Test Location**: `src/lib/server/**/__tests__/*.test.ts`

**Running Tests**:

```bash
npm run test                  # Run all tests
```

**Test Configuration Notes**:

- Tests run in Node environment (not browser)
- Only server-side code in `src/lib/server/` is tested
- Vitest config prevents loading SvelteKit's vite config to avoid Svelte plugin conflicts
- Environment variables in tests: Use lazy imports (`await import('$env/static/private')`) to avoid module resolution issues

**Test Coverage**:

- This repository uses Codecov for coverage reporting
- Coverage workflow runs on push to `main` branch
- Requires `CODECOV_TOKEN` set in repository secrets for CI/CD
- Coverage badge available at: `https://codecov.io/gh/jhonkus/jadihebatcom`

**Example Test Pattern** (from `turso-blog.test.ts`):

- Mock API responses using `fetch` mocks
- Test helper functions (e.g., `formatDate`, `getImageUrl`, `formatArticle`)
- Verify data transformations and edge cases

## Common Gotchas

1. **Token refresh timing**: Access tokens expire in 30 minutes (configurable via `hooks.server.ts:100` and Directus settings). Hooks handle refresh transparently, but long-running operations may need re-validation.

2. **Cookie consistency**: Always set both `jadihebat_auth` AND `jadihebat_user` when establishing auth. Missing either breaks SSR/client sync.

3. **Directus field arrays**: Many queries expect nested fields (e.g., courses with sections and lessons). Follow existing query patterns to maintain response shapes.

4. **Environment variable confusion**: `wrangler.jsonc` vars are for reference. Runtime reads from actual environment (`.env` locally, Cloudflare vars in production).

5. **Client-only vs server-only**: Services check `browser` constant. Never import `src/lib/services/*` in server code or `src/lib/server/*` in client code.

6. **Data serialization security**: SvelteKit serializes all data returned from `+layout.server.ts` and `+page.server.ts` into the HTML for client-side hydration. **NEVER return sensitive user data** (email, user ID, tokens) from these functions unless absolutely necessary for that specific page. Use `locals.user` to access full user data on the server-side. The layout only returns `{ first_name, last_name }` to minimize data exposure. Pages that need additional user data (like `/profile`) should have their own `+page.server.ts` that returns only what's needed for that page.

7. **Stale cookie handling**: Course detail pages are public (no auth required). The enrollment check (`checkEnrollment()`) must NEVER redirect to login on 401 - it should fail silently. Stale auth cookies can exist after logout or token expiry; pages should handle this gracefully. Only redirect to login when user actively clicks "Enroll" button.

## Integration Examples

**Check if user enrolled** (server):

```typescript
// src/routes/api/enrollments/check/+server.ts
const enrollment = await directusClient.request(
	readItems('enrollments', {
		filter: { user_id: { _eq: userId }, course_id: { _eq: courseId } }
	})
);
```

**Mark lesson complete** (server):

```typescript
// src/routes/api/progress/lesson/complete/+server.ts
// 1. Create/update lesson_progress
// 2. Recalculate enrollment progress percentage
// 3. Update enrollments record
```

**Client enrollment flow** (client):

```typescript
import { enrollInCourse } from '$lib/services/enrollmentService';
const result = await enrollInCourse(courseId);
```
