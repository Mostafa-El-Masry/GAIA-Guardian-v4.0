# GAIA Guardian · Level 3
## Week 2 – Brain log schema (Supabase)

This week is **database-only**. No existing pages or components are touched.
You will:

- Create a new Supabase table: `guardian_daily_runs`
- Prepare for the Brain to log each daily run there later.

## Table: guardian_daily_runs

Suggested columns:

- `id`          – `uuid`, primary key, default `gen_random_uuid()`
- `user_id`     – `text`, nullable (we will use this when multi-user arrives)
- `run_date`    – `date`, the logical day the Brain processed (e.g. `2027-01-01`)
- `ran_at`      – `timestamptz`, when the Brain actually ran
- `notes`       – `jsonb`, will store an array of short strings (Brain notes)
- `created_at`  – `timestamptz`, default `now()`

The TypeScript interface `GuardianDailyRunRecord` in `lib/guardian/types.ts`
is shaped to match this table once we start reading/writing it.

Future weeks will:

- Insert into `guardian_daily_runs` each time `/api/brain/run` is called
- Read recent runs for dashboards / debug pages
- Filter by `user_id` when multi-user support is active
