# Happy Plants

## Deploy

```sh
pnpm deploy:droplet
```

This builds locally, rsyncs `build/` + `.env.prod` to the droplet, then over
SSH: `git pull`s the repo, rebuilds the Docker image, runs database
migrations (see below), and restarts the container.

## Database migrations

Schema lives in `src/db/schema.ts` (Drizzle ORM, SQLite via `@libsql/client`).
The db file is a local sqlite file — `src/db/happyplants.db` in dev, or
`/data/happyplants.db` in prod (mounted from `/root/data` on the droplet via
`docker-compose.yml`).

Normal workflow for a schema change:

1. Edit `src/db/schema.ts`.
2. `pnpm db:generate` — creates a new migration file and updates the
   journal/snapshot in `src/db/migrations/`.
3. `pnpm db:migrate` — applies it locally and lets you test it.
4. Commit the new migration files along with your code changes.
5. `pnpm deploy:droplet` — migrations run automatically against production as
   part of the deploy (via a one-off `docker compose run --rm waterplants
   pnpm db:migrate`, using the same image and volume-mounted db as the
   running app).

`db:migrate` is intentionally self-contained (no `$lib`/`src/*` aliases, no
`drizzle-kit`) so it can run inside the slim production image, which only has
`dependencies` installed (not `devDependencies`).

If `db:migrate` ever fails with something like `table X already exists`, it
means the db's `__drizzle_migrations` tracking table has drifted from the
actual schema (e.g. it was bootstrapped some other way, or the migrations
folder was reset without the db being touched). Back up the db file, then run
`pnpm db:reconcile` to mark existing migrations as already-applied based on
the files on disk, and re-run `pnpm db:migrate` to catch up on anything
genuinely new.

## Cleanup

```sh
pnpm knip
```
