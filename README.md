# Dituria Islame Platform

Modern bilingual Islamic knowledge platform (Albanian default, English optional) with structured content and a full admin control system.

## Tech Stack

- Next.js 16 (App Router, TypeScript)
- Prisma ORM
- PostgreSQL
- Tailwind CSS

## Core Sections

- Hadithet
- Lutjet
- Kuran
- Historite e Pejgambereve
- Akide
- Fikh

## Hadith Structure

Hadithet -> Books -> Chapters -> Entries

Each entry supports:

- title_sq, title_en
- content_sq, content_en
- optional arabic_text
- hadith number
- source/reference
- tags
- publish/draft status

## Admin Features

- Login-protected admin area
- CRUD: sections, categories, hadith books, hadith chapters, entries
- Live duplicate detection during entry create/update:
	- duplicate titles
	- similar content
	- same hadith number within same book
- Draft/publish workflow
- Autosave draft in form
- Preview before publishing
- Entry revision snapshot on update

## Search Features

- Live instant search while typing
- Case-insensitive partial matching
- Search across titles, content, tags, source, categories
- Global search page grouped by section
- Section-specific search
- Book-specific search in hadith book detail page

## Database Models

- Section
- Category
- HadithBook
- HadithChapter
- Entry
- EntryRevision

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DB_NAME?schema=public"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123"
ADMIN_SESSION_TOKEN="change-this-token"
```

3. Generate Prisma client:

```bash
npm run db:generate
```

4. Run migrations:

```bash
npm run db:migrate
```

5. Seed initial data:

```bash
npm run db:seed
```

6. Start development server:

```bash
npm run dev
```

7. Open:

- Public app: `http://localhost:3000`
- Admin login: `http://localhost:3000/admin/login`

## Notes

- The app expects a running PostgreSQL instance.
- Next.js 16 currently warns that `middleware` is deprecated in favor of `proxy`; current implementation remains functional.

## Deploy On Render

### Option 1: Blueprint (recommended)

1. Push this repository to GitHub.
2. In Render, click **New +** -> **Blueprint**.
3. Select this repo. Render will detect `render.yaml`.
4. Set these environment variables for the web service:
	- `ADMIN_USERNAME`
	- `ADMIN_PASSWORD`
	- `ADMIN_SESSION_TOKEN`
5. Deploy.

The blueprint provisions:

- one Node web service (`muslim-com-web`)
- one PostgreSQL database (`muslim-com-db`)

### Option 2: Manual service setup

If you do not want to use Blueprint, create a PostgreSQL service and a Node web service manually with:

- Build command: `npm ci && npm run db:generate && npx prisma migrate deploy && npm run build`
- Start command: `npx prisma migrate deploy && npm run start`

Set environment variables:

- `DATABASE_URL` (from your Render PostgreSQL connection string)
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_TOKEN`

### Render Notes

- `prisma migrate deploy` runs on every start safely and only applies pending migrations.
- Health checks use `/api/health`, which verifies database connectivity.
- Keep `ADMIN_SESSION_TOKEN` long and random in production.
- `NODE_ENV` is handled by Render automatically in production.
