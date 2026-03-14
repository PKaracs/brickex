# Brickex Backend Architecture

## Stack

- Supabase Postgres for the primary relational database.
- Supabase Storage for private source assets, generated media, and exports.
- Drizzle ORM for schema ownership, migrations, and typed queries.
- Better Auth for authentication, sessions, organizations, usernames, magic links, and 2FA.
- TypeScript / Node.js server actions and route handlers as the only write path.

## Why this design

Brickex is not a flat CRUD app. The core backend problem is preserving lineage across:

- workspaces
- property projects
- uploaded references
- AI runs
- generated images
- generated videos
- approved deliverables
- billing and usage events

The schema is designed around that lineage so every render or video can be traced back to:

- which workspace created it
- which project it belongs to
- which prompt/settings were used
- which inputs were attached
- which provider/model produced it
- which deliverable exposed it

## Auth model

Better Auth owns:

- `users`
- `sessions`
- `accounts`
- `verifications`
- `organizations`
- `members`
- `invitations`
- `two_factors`

Every new user is provisioned with a default workspace automatically. The application uses Better Auth as the identity source of truth, not Supabase Auth, which means:

- database access stays server-side through Drizzle
- browser uploads use signed Supabase Storage URLs issued by the server
- private buckets remain private without relying on Supabase client auth state

## Domain model

### Workspace layer

- `workspace_settings`: brand, timezone, defaults, and presentation preferences
- `subscriptions`: provider-agnostic billing state per workspace
- `usage_ledger`: immutable credit and usage events

### Project layer

- `projects`: the live property marketing entity
- `project_versions`: immutable snapshots of briefs/settings for reproducibility

### Media layer

- `assets`: every file in storage, typed by purpose and media kind
- `upload_sessions`: signed upload coordination and confirmation state
- `deliverables`: curated outputs ready for review or publishing

### Generation layer

- `tool_runs`: each AI invocation or export request
- `tool_run_attempts`: retry and provider diagnostics
- `tool_run_assets`: input/output/reference lineage between runs and assets

### Operations layer

- `webhook_events`: idempotent provider callback ingestion
- `audit_logs`: actor and entity history for support and compliance

## Storage strategy

Buckets:

- `brickex-project-assets`: private source uploads and references
- `brickex-generations`: private generated images and videos
- `brickex-exports`: private publish-ready exports
- `objects`: public marketing assets and static examples

The app stores `bucket` + `path` on every asset row instead of opaque external URLs. URLs are generated just-in-time with signed links. That prevents long-lived public leakage and keeps media portable if bucket strategy changes.

## Upload flow

1. Client asks `/api/projects/images/setup` for signed upload URLs.
2. Server creates `assets` and `upload_sessions` rows before the upload starts.
3. Client uploads directly to Supabase Storage.
4. Client calls `/api/projects/images/confirm`.
5. Server verifies the object exists, finalizes metadata, and marks the asset `ready`.

That makes uploads idempotent, auditable, and resumable from a data-model perspective.

## Generation flow

1. Create a `tool_runs` row with `queued` status.
2. Attach all inputs through `tool_run_assets`.
3. Store provider attempts in `tool_run_attempts`.
4. Persist generated outputs as `assets`.
5. Promote chosen outputs into `deliverables`.
6. Write usage/credit consumption into `usage_ledger`.

## Operational guidance

- Run `npm run db:generate` after schema changes.
- Run `npm run db:migrate` to apply migrations.
- Use private buckets and signed URLs for all customer media.
- Keep provider callbacks idempotent by keying on `provider + externalEventId`.
- Never store prompt-only output URLs without an `assets` row; otherwise lineage breaks.
