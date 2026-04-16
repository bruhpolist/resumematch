# Railway: import from Docker Compose

This repo includes `docker-compose.railway.yml` for staged import of services to Railway.

## What gets imported

- `web` (Next.js + API + migrations from `Dockerfile.web`)
- `postgres` (PostgreSQL 16)

## How to use

1. In Railway, create/open your project.
2. Drag and drop `docker-compose.railway.yml` onto the Railway project canvas.
3. Review staged changes and apply them.
4. In `web` service Variables, set secrets:
   - `SESSION_SECRET`
   - `OPENROUTER_API_KEY`
   - optional payment variables (`YOOKASSA_*`, `CARDLINK_*`)
5. Deploy services.
6. Add custom domain `www.resumematch.ru` in `web` service networking.

## Notes

- Compose import creates Railway services from this file, but secret values should still be set in Railway Variables.
- `railway.json` remains available for non-Docker single-service deploy flow.

## One-command bootstrap (CLI)

If you already deployed only `web` and want to auto-create Postgres + wire variables:

```powershell
pwsh ./scripts/railway-bootstrap.ps1 -WebService web -Environment production
```

The script:
- adds PostgreSQL service
- sets `DATABASE_URL` on `web` as a Railway reference to Postgres
- sets DB runtime flags (`DATABASE_SSL`, `DATABASE_SSL_STRICT`)
