# Railway Deploy Guide

## 1. Create Railway project

1. Go to Railway dashboard.
2. Create a new project.
3. Add a PostgreSQL service.
4. Add a GitHub service and select this repository.

## 2. Configure app service commands

Set these service commands in Railway app settings:

- Build Command:

```bash
npm ci && npm run db:generate && npm run build
```

- Start Command:

```bash
npx prisma db push && npm run start
```

The start command keeps schema synced to current Prisma models.

## 3. Environment variables

Set these variables for the app service:

- DATABASE_URL (from Railway PostgreSQL service)
- ADMIN_USERNAME
- ADMIN_PASSWORD
- ADMIN_SESSION_TOKEN

Railway auto-sets `PORT`. Do not hardcode it.

## 4. First data bootstrap

After first successful deploy, run one deploy with these temporary Start Command commands, one at a time:

```bash
npm run db:seed && npm run db:import:quran && npm run start
```

After that deploy succeeds, change Start Command back to:

```bash
npx prisma db push && npm run start
```

## 5. Verify

- Open `/api/health` and confirm `ok: true`.
- Open `/admin/login` and sign in.
- Check public sections and Quran pages.

## 6. Optional: full local data copy

If you want all current local admin content in Railway DB, run from your machine:

```bash
LOCAL_DATABASE_URL="<your-local-postgres-url>" RENDER_DATABASE_URL="<railway-postgres-url>" npm run db:copy:to-render
```

For PowerShell use:

```powershell
$env:LOCAL_DATABASE_URL="<your-local-postgres-url>"
$env:RENDER_DATABASE_URL="<railway-postgres-url>"
npm run db:copy:to-render
```

Note: the copy script replaces target data.
