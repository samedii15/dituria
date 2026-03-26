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
