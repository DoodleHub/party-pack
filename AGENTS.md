<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# party-pack

A Next.js + Supabase party-game platform. Multiple games live side by side
(`survey-showdown`, `yakuza`, `koup`), each with its own room/lobby/game-state
code, sharing one auth and Supabase setup.

## Stack

- Next.js 16 (App Router), React 19, Tailwind v4, TypeScript.
- Supabase: Postgres + Auth + Realtime, accessed via `@supabase/ssr` and
  `@supabase/supabase-js`.
- No custom backend — game logic lives in Postgres functions, called
  directly from client components via `supabase.rpc(...)`. There are no
  `app/api/*` routes for game mutations.

## Routing / games

- `lib/games.ts` is the registry of games shown on `/games`.
- Each game has `app/games/<slug>/page.tsx` (lobby) and
  `app/games/<slug>/room/[code]/page.tsx` (a room), plus a
  `components/<Game>/` folder with a `lobbyData.ts` and (once built out) a
  `data.ts` for room/game state.
- **Survey Showdown is the only fully-built game** — real rooms, teams,
  turns, Realtime chat/presence, all backed by Postgres RPCs. Yakuza and
  Koup currently only have lobby UI wired to static mock data
  (`lobbyData.ts`); there's no room/game backend for them yet. Don't assume
  they follow the same DB patterns until they're actually built out.

## Auth

- Supabase email/password auth (not anonymous, not magic link). Sign-up
  (`app/actions/auth.ts`, `components/auth/SignupForm.tsx`) requires a
  unique `username` (checked against `profiles`) and email confirmation via
  `emailRedirectTo` → `app/auth/callback/route.ts`
  (`exchangeCodeForSession`).
- **`proxy.ts` at the repo root is this version's `middleware.ts`** —
  exports `proxy()`, not `middleware()`. It delegates to
  `lib/supabase/proxy.ts#updateSession`, which calls
  `supabase.auth.getClaims()` and redirects unauthenticated visitors away
  from any `/games/*` route to `/signup`. `/games` itself (the browse page)
  is public.
- Three separate Supabase client constructors, use the matching one:
  `lib/supabase/client.ts` (browser/client components), `lib/supabase/server.ts`
  (server components/actions, cookie-based), `lib/supabase/proxy.ts`
  (the proxy/middleware request/response cycle). Don't reuse one across
  contexts — see the comments in `updateSession` about why the sequence
  around `getClaims()` and returning `supabaseResponse` matters.

## Database — schema lives in the remote project, not this repo

- **There is no `supabase/migrations` folder here.** All schema/function
  changes for this project have been applied directly to the remote
  Supabase project (via the Supabase MCP tools), not committed to git.
  `git log`/`grep` will NOT show you the current schema or Postgres
  function bodies.
- Before touching anything DB-related, use the Supabase MCP tools —
  `list_tables`, `list_migrations`, `execute_sql` (read-only lookups),
  `apply_migration` (schema changes) — to see current, ground-truth state.
  Don't guess table/column names or assume a function does what its name
  implies; read it.
- Game business logic (join team, submit answer, turn advancement, host
  transfer/disconnect handling, scoring, bot/system chat messages, etc.)
  lives in `SECURITY DEFINER` Postgres functions, not in Next.js server
  actions. The client mostly just calls `supabase.rpc("fn_name", args)`
  directly from `data.ts` files. If a feature seems to be missing
  server-side validation, check the Postgres function — it's probably
  there, not in the TS layer.

## Realtime / presence patterns (established in Survey Showdown; reuse for future games)

- Player online/offline detection uses a Supabase Realtime **Presence**
  channel per room (`room-presence-${roomId}`), keyed by `userId` so
  multiple tabs from one user count as one online player.
- A grace period (`DISCONNECT_GRACE_MS`, currently 8s in
  `SurveyShowdownGame.tsx`) absorbs brief reconnects/refreshes before a
  presence "leave" is treated as a real departure — check
  `onlineIdsRef.current` again once the timer fires.
- There are **two distinct "player left" code paths** that both need
  handling, not just one: (1) passive detection via the presence channel's
  `leave` event (tab closed/crashed/network dropped), and (2) an explicit
  `useEffect` unmount-cleanup for in-app navigation away (e.g. "Back to
  Lobby"). They fire different combinations of RPCs — see
  `SurveyShowdownGame.tsx` around the presence subscription and the
  unmount-cleanup effect.
- Bot/system messages (team joins, guesses, host transfers, disconnects,
  round announcements, etc.) all funnel through one Postgres helper per
  game (`survey_showdown_post_system_message`), which inserts into the
  messages table with `user_id = null, name = 'Game'`.

## ⚠️ Must know: supabase-js RPC/query calls are lazy — awaiting them is not optional

`supabase.rpc(...)` (and `.from(...).select()`, etc.) returns a
`PostgrestBuilder`, a **lazy thenable**. Reading
`node_modules/@supabase/postgrest-js/src/PostgrestBuilder.ts` confirms the
actual `fetch()` only happens inside `.then()` — nothing in the
constructor triggers it. If a call is neither `await`ed nor `.then()`'d,
**by the call site or inside the wrapper function**, the request is built
and silently discarded. No error, no warning, no console output — the
mutation just never happens, forever.

This already caused a real, hard-to-find bug: `announceDisconnect`,
`announceReconnect`, and `announceLeftGame` in
`components/SurveyShowdown/data.ts` were plain arrow functions
(`export const f = (...) => supabase.rpc(...)`) called fire-and-forget at
every call site. The result: disconnect/reconnect/left-game bot messages
never posted, ever, with nothing in any log to point at why — while
`transferHost`, defined as `async function` that `await`s the RPC
internally, worked fine every time.

**Rule:** every `data.ts` wrapper around a Supabase call must be an
`async function` that `await`s the call internally (see `transferHost`,
`leaveTeam`, `claimHost` in `components/SurveyShowdown/data.ts` for the
correct pattern), so a fire-and-forget call site is still safe. Never
write `export const f = (...) => supabase.rpc(...)` — always
`export async function f(...) { await supabase.rpc(...); }`. If you're
debugging "this mutation doesn't seem to happen and there's no error
anywhere," check this first.
