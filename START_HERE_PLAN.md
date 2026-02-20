# Tone Guru — Start Here Plan (Reordered)

This version prioritizes building the **Fender Tone Master Pro (TMP) catalog database + API first**, so your custom GPT has a trustworthy source of truth before user-facing features.

## 1) Build the TMP foundation first (week 1)

First deliverable:
- A database that stores an exhaustive TMP model catalog.
- Every parameter for every model.
- Valid ranges, units, defaults, enum options, and firmware availability.
- Read APIs that your custom GPT can query.

Why first:
- Prevents AI hallucinations early.
- Lets every later feature (preset generation, validation, editing) rely on one authoritative source.

## 2) Recommended stack (novice-friendly, Vercel-compatible)

- Frontend + backend: **Next.js (App Router) + TypeScript**
- Database: **PostgreSQL** (Neon or Supabase)
- ORM: **Prisma**
- API style: Next.js Route Handlers (REST)
- Validation: **Zod**
- Auth (phase 2): **Auth.js (NextAuth)** with Google + Apple
- Hosting: **Vercel (Hobby)**
- AI integration: OpenAI Responses API (tool/function calling)

## 3) TMP catalog schema (authoritative core)

Create these first:
- `TmpFirmwareVersion`
- `TmpModel`
  - `modelKey` (stable unique key)
  - `displayName`
  - `category` (amp, cab, drive, mod, delay, reverb, utility, etc.)
  - `description`
- `TmpModelParameter`
  - `paramKey` (stable unique key)
  - `name`
  - `dataType` (`number` | `enum` | `toggle`)
  - `unit` (dB, %, Hz, ms, etc.)
  - `minValue`, `maxValue`, `step`
  - `enumOptions` (JSON)
  - `defaultValue`
- `TmpModelAvailability`
  - links model/parameter to firmware versions

Recommended metadata fields:
- `sourceType` (manual, release_note, verified_user)
- `sourceUrl`
- `confidence`
- `lastVerifiedAt`

## 4) TMP data ingestion pipeline

Build importer tooling before any AI logic:
1. Define CSV templates (`tmp_models.csv`, `tmp_parameters.csv`, `tmp_availability.csv`).
2. Implement `scripts/import-tmp-catalog.ts` (idempotent upsert).
3. Add validation checks:
   - duplicate `modelKey` / `paramKey`
   - invalid min/max/step
   - missing units where required
4. Add `scripts/validate-tmp-catalog.ts` to fail on malformed catalog rows.

## 5) TMP API for custom GPT (ship this before auth)

Minimum endpoints:
- `GET /api/tmp/models`
- `GET /api/tmp/models/:modelKey`
- `GET /api/tmp/models/:modelKey/parameters`
- `GET /api/tmp/firmware/:version/models`

Requirements:
- Strict response schemas (Zod).
- Stable IDs/keys for function calling.
- Include machine-readable constraints (type, min/max, step, enumOptions, unit).
- Return `400/404` on invalid keys.

## 6) AI integration against TMP API

Once TMP API exists, implement constrained generation:
1. AI gets user prompt (tone target / artist).
2. AI tool call fetches valid models + params from TMP API.
3. AI outputs a candidate chain using only returned keys.
4. Server validates every block and parameter against TMP schema.
5. Store only validated presets.

Hard guardrails:
- Unknown model key: reject.
- Unknown parameter key for model: reject.
- Out-of-range value: reject.
- Wrong type/unit: reject.

## 7) Then add users + auth (phase 2)

After TMP foundation is stable:
- Add Auth.js with Google first, Apple second, magic link optional.
- Add protected routes.
- Add user profile data:
  - musical styles
  - skill level
  - tone goals

Core tables now:
- `User`, `Account`, `Session`
- `UserProfile`
- `Guitar`
- `Pickup`
- `UserGear`
- `TonePreference`

## 8) Then add presets create/edit/save (phase 3)

Preset tables:
- `Preset`
- `PresetBlock` (ordered signal chain)
- `PresetBlockParam`
- `PresetRevision` (version history)

Important design:
- Store presets as:
  1) normalized relational rows
  2) JSON snapshot for export/rollback

APIs:
- `POST /api/presets`
- `PATCH /api/presets/:id`
- `GET /api/presets/:id`
- `GET /api/presets/:id/revisions`

## 9) Security and reliability baseline

- Row ownership checks using `userId`.
- Rate-limit AI endpoints.
- Redact logs for sensitive fields.
- Keep API keys/secrets in Vercel env vars.
- Add a nightly TMP catalog integrity check job.

## 10) Revised milestone order

Milestone 1 (Catalog core):
- Prisma schema for TMP models/params/firmware
- CSV templates + importer + validator
- Seed initial catalog

Milestone 2 (Catalog API):
- Read-only TMP API endpoints
- Schema validation and API tests

Milestone 3 (AI constraints):
- `POST /api/ai/recommend-preset`
- strict server validation against TMP catalog

Milestone 4 (Auth + profiles):
- Google login, then Apple
- user preferences + gear library

Milestone 5 (Presets):
- Create/edit/save/version presets
- Reload and compare revisions

Milestone 6 (Polish):
- Better UX, explainability, quality tuning

## 11) First 10 concrete tasks (reordered)

1. Create Next.js + TypeScript project.
2. Configure Prisma + hosted Postgres.
3. Implement TMP schema (`TmpModel`, `TmpModelParameter`, `TmpFirmwareVersion`, `TmpModelAvailability`).
4. Create TMP CSV templates.
5. Build importer script with idempotent upserts.
6. Build catalog validation script.
7. Add TMP read APIs with Zod response schemas.
8. Add `POST /api/ai/recommend-preset` that enforces TMP constraints.
9. Add Auth.js (Google first, Apple second).
10. Add user gear/profile + preset save/edit/versioning.

## 12) Success criteria for this sequence

- TMP catalog is queryable and validated before user features.
- AI can only emit models/parameters that exist and are valid.
- Users can then sign in, store gear/preferences, and save/edit presets safely.
- Every persisted preset remains compliant with known TMP constraints.

---

If you want, next step is I can generate:
1) an initial Prisma schema for TMP catalog tables,
2) CSV template files,
3) starter route handlers for the TMP API.
