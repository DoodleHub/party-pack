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
- **Survey Showdown and Koup are fully-built games** — real rooms, players,
  turns, Realtime chat/presence, all backed by Postgres RPCs. **Yakuza is
  still lobby-only**, wired to static mock data (`lobbyData.ts`) with no
  room/game backend yet. Don't assume Yakuza follows the same DB patterns
  until it's actually built out.
- Survey Showdown and Koup share the same *client-side* architecture (see
  below) but have fully independent DB schemas (`survey_showdown_*` vs
  `koup_*` tables/RPCs, one Postgres function per game action). Don't assume
  a column or RPC name carries over between the two games — check
  `list_tables` / the function body for the game you're actually touching.

## Client-side game architecture (Survey Showdown & Koup — reuse this shape for future games)

- `app/games/<slug>/room/[code]/page.tsx` is a thin wrapper that renders
  `<XGame roomCode={code} />` — practically no logic of its own.
- `components/<Game>/<Game>Game.tsx` is the single stateful orchestrator: it
  owns the `RoomState` (`useState`), runs the Realtime subscription,
  presence tracking, and disconnect/leave handling, and passes plain props
  + callbacks down to presentational children (`WaitingRoom`,
  `StatusPanel`/`GameStage`, sidebars, log/chat panels, …). Children hold no
  server state themselves — they call the callbacks, which call `data.ts`
  functions and then re-`refresh()`.
- **State is always refetched whole, never patched incrementally.** Every
  mutation (`declareAction`, `submitAnswer`, …) and every Realtime
  `postgres_changes` event ends up calling the same `fetchRoomState(...)` /
  `refresh()` that re-reads the entire room from Postgres and replaces
  `state` wholesale — see `refresh` + `subscribeToRoom(roomId, refresh)` in
  `KoupGame.tsx` / `SurveyShowdownGame.tsx`. There's no optimistic UI and no
  partial-state merging; a new mutation should follow the same
  call-RPC-then-`refresh()` shape rather than hand-patching `state` locally.
- `components/<Game>/data.ts` is the only place that touches
  `supabase.rpc(...)` / `.from(...)`. It maps DB snake_case rows to the
  camelCase shapes in `types.ts` (see `fetchRoomState` in either game's
  `data.ts`) and exposes one `async function` wrapper per RPC — see the lazy
  RPC rule further down for why these must always be `async function`, never
  arrow consts.
- `components/<Game>/types.ts` defines the client-side `RoomState` shape
  that `data.ts` maps into and every component consumes — treat it as the
  contract between the DB layer and the UI, not as a mirror of the DB
  schema.
- Server-authoritative timers (turn timers, challenge/block response
  windows) are exposed as a `response_deadline` timestamp column. Whichever
  client happens to have the room open sets a local `setTimeout` past that
  deadline and calls an idempotent "expire" RPC (`expireResponse` in Koup,
  `expireTurn` in Survey Showdown) — see the `useEffect` keyed on
  `state.responseDeadline` in `KoupGame.tsx`. The RPC has to be safe to call
  from multiple racing clients since more than one may be watching.

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

## Realtime / presence patterns (established in Survey Showdown, confirmed in Koup — reuse for future games)

- Player online/offline detection uses a Supabase Realtime **Presence**
  channel per room (`room-presence-${roomId}`), keyed by `userId` so
  multiple tabs from one user count as one online player.
- A grace period (`DISCONNECT_GRACE_MS`, currently 8s in both
  `SurveyShowdownGame.tsx` and `KoupGame.tsx`) absorbs brief
  reconnects/refreshes before a presence "leave" is treated as a real
  departure — check `onlineIdsRef.current` again once the timer fires.
- There are **two distinct "player left" code paths** that both need
  handling, not just one: (1) passive detection via the presence channel's
  `leave` event (tab closed/crashed/network dropped), and (2) an explicit
  `useEffect` unmount-cleanup for in-app navigation away (e.g. "Back to
  Lobby"/"Leave Room"). They fire different combinations of RPCs — see
  either game's `Game.tsx` around the presence subscription and the
  unmount-cleanup effect.
- Bot/system messages (team joins, guesses, host transfers, disconnects,
  round announcements, etc.) all funnel through one Postgres helper per
  game (`survey_showdown_post_system_message`, `koup_log_events` inserts),
  which inserts into a log/messages table with `user_id = null`.
- **Koup adds one variation worth knowing**: while `status === "waiting"`
  (the pre-game table), a presence `leave` triggers an **immediate** kick
  (`removePlayer`) instead of waiting out `DISCONNECT_GRACE_MS` — there's no
  game state to protect yet and rejoining is instant (see auto-join below),
  so there's no reason to let an empty seat linger. The grace period only
  kicks in once `status === "active"`. See the `onLeave` callback in
  `KoupGame.tsx`.
- **Koup also auto-seats** a visiting authenticated user into an open,
  unlocked, non-full `waiting` room instead of requiring an explicit "Join
  Table" click — see the `autoJoinPendingRef` effect in `KoupGame.tsx`.
  Survey Showdown requires an explicit team-join action instead; don't
  assume auto-join is the shared default for a new game.

## Koup — Coup-clone rules & state machine

Koup implements the bluffing game *Coup* (5 characters: Duke, Assassin,
Captain, Ambassador, Contessa). If you're not already familiar with Coup,
read `components/Koup/GameRulesModal.tsx` and `components/Koup/characters.tsx`
(`ACTION_META`/`CHARACTER_META`) first — they're the client-side source of
truth for what each action/character does and are referenced throughout the
UI components.

- **The turn structure is a server-driven state machine**, exposed to the
  client as a single `phase` column on `koup_rooms` (`Phase` in
  `components/Koup/types.ts`): `awaiting_action` → `awaiting_response`
  (someone declared a challengeable/blockable action) →
  `awaiting_block_challenge` (someone blocked it) → either
  `awaiting_exchange_select` (Ambassador) or `awaiting_influence_loss`
  (someone must reveal a card) → back to `awaiting_action`.
  `components/Koup/StatusPanel.tsx` is one large `if (state.phase === ...)`
  switch rendering the right UI per phase — it's the first place to check
  when a Koup action isn't rendering what you'd expect.
- Tables: `koup_rooms`, `koup_players`, `koup_cards` (one row per Influence
  card, with a `revealed` flag), `koup_log_events` (system log),
  `koup_chat_messages`. All mutations go through `SECURITY DEFINER` RPCs
  prefixed `koup_*` (`koup_declare_action`, `koup_challenge_action`,
  `koup_block_action`, `koup_challenge_block`, `koup_choose_influence`,
  `koup_resolve_exchange`, `koup_expire_response`, etc.) — see
  `components/Koup/data.ts` for the full list. As with Survey Showdown, the
  actual rules (who can challenge what, bluff resolution, elimination
  order) live in the Postgres function bodies, not the TS layer — read the
  function before assuming what an RPC does.
- **Chat and the system/game log are one merged, chronologically
  interleaved feed, not two separate UIs.** `GameLogPanel.tsx` fetches both
  `koup_log_events` and (if `enableChat`) `koup_chat_messages`, merges them
  by `createdAt`, and renders a single scrolling list — `RightPanel.tsx` is
  just `GameLogPanel` + `QuickReferencePanel`, with no separate chat
  component. An earlier standalone `ChatModal.tsx` was removed in favor of
  this merged panel — don't reintroduce a separate chat UI when extending
  Koup.
- Log events (`koup_log_events.text`) are stored as flat, pre-formatted
  strings (e.g. `"Noah claims Duke and takes Tax"`), not structured
  actor/verb/target fields. `useGameLog.ts#matchLogActor` does a
  best-effort "does the text start with a known player's name" match purely
  to attach an avatar in the UI — it's not a reliable parse; don't build new
  logic on top of string-matching log text.

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

## ⚠️ Must know: three color-token families in `app/globals.css` — never mix them

Tailwind theme colors here split into three families that look
interchangeable but are not. Full rationale and hex values live in the doc
comment at the top of `app/globals.css` — read that before adding a fourth.

- **Theme-flipping**: `text-ink`, `text-muted`, `bg-surface`, `bg-surface-alt`,
  `bg-primary-tint` + `text-primary`. Overridden under
  `@media (prefers-color-scheme: dark)`. Use ONLY on elements sitting
  directly on `bg-surface` (the page background) or another theme-flipping
  surface, so both sides flip together.
- **Fixed light**: `bg-card`, `text-card-foreground`, `text-card-muted`,
  `bg-card-hover`, `Badge variant="card"`, `Button variant="outline"`. Never
  overridden for dark mode — `bg-card` is `#ffffff` in both themes. This is
  deliberate for surfaces that should always read as light/inviting
  regardless of theme (the game lobby / room browser —
  `components/GameLobby/RoomRow.tsx` is the reference example).
- **Panel** (theme-flipping card): `bg-panel`, `text-panel-foreground`,
  `text-panel-muted`, `bg-panel-hover`, `Badge variant="panel"`, `Button
  variant="panel"`. Same white-on-white-page look as fixed-light in light
  mode, but flips to a dark slate surface in dark mode instead of staying
  white. Use this for card-heavy screens people spend real time looking at
  (a full game board) — a screenful of fixed-white `bg-card` panels against
  a dark page is glare-inducing even though the text stays legible.
  `components/Koup/GameInfoSidebar.tsx` is the reference example.

This family split already caused two real bugs, both in the Koup
in-progress-game redesign:
1. It used `text-ink`/`border-ink/*`/`bg-ink/*`, `Button variant="ghost"`,
   and `Badge variant="outline"`/`"muted"` throughout its `bg-card` panels.
   Fine in light mode; in dark mode `--color-ink` flips to near-white while
   `bg-card` stays fixed white, so headlines/labels/buttons went nearly
   invisible, all at once, because the same wrong pairing was copy-pasted
   everywhere.
2. After fixing that, the panels were technically legible but still pure
   white against a near-black dark-mode page — glaring, not actually a
   contrast bug. That's what motivated adding the `panel` family above,
   and Koup was migrated from `card` to `panel` wholesale.

**Rule:** pick ONE family per surface and stay inside it for everything
nested in that surface — never pair a theme-flipping foreground (`text-ink`,
`text-muted`, `border-ink/*`, `bg-ink/*`, `Button variant="ghost"`, `Badge
variant="outline"`/`"muted"`) with a `bg-card` or `bg-panel` surface. For a
new card-heavy game/screen, default to `panel` unless there's a specific
reason it should stay pure-white in dark mode (matching the lobby's fixed
family instead). Before shipping, sanity-check by eye with the OS color
scheme toggled to dark (or `prefers-color-scheme: dark` in devtools) — both
bugs above were invisible in light mode.
