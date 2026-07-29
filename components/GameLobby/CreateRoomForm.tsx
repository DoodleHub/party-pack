"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import {
  ArrowRightIcon,
  ChatIcon,
  CheckIcon,
  ChevronDownIcon,
  ClockIcon,
  EyeIcon,
  EyeOffIcon,
  GlobeIcon,
  LightbulbIcon,
  LockIcon,
  ShieldIcon,
  TagIcon,
  UserIcon,
  UsersIcon,
} from "@/components/ui/Icon";
import homeHeroImage from "@/public/games/home-hero.png";
import type { GameLobbyInfo } from "@/components/GameLobby/types";
import type { GameCover } from "@/lib/games";

function isImageCover(cover: GameCover): cover is Exclude<GameCover, { gradient: string }> {
  return !("gradient" in cover);
}

function parsePlayerRange(players: string) {
  const match = players.match(/(\d+)\D+(\d+)/);
  if (!match) return { min: 2, max: 8 };
  return { min: Number(match[1]), max: Number(match[2]) };
}

function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join(
    "",
  );
}

const TIPS = [
  "A clear room name helps friends find you.",
  "Private rooms are perfect for invited groups.",
  "Auto-start keeps the game moving!",
  "You can change settings anytime in the lobby.",
];

interface CreateRoomFormProps {
  game: GameLobbyInfo;
}

export function CreateRoomForm({ game }: CreateRoomFormProps) {
  const router = useRouter();
  const { min, max } = useMemo(() => parsePlayerRange(game.players), [game.players]);

  const [roomName, setRoomName] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [maxPlayers, setMaxPlayers] = useState(max);
  const [autoStart, setAutoStart] = useState(true);
  const [allowSpectators, setAllowSpectators] = useState(true);
  const [enableChat, setEnableChat] = useState(true);

  const previewName = roomName.trim() || "Friday Night Fun";
  const playerCounts = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  function handleCreateRoom() {
    router.push(`/games/${game.slug}/room/${generateRoomCode()}`);
  }

  return (
    <div className="flex flex-1 flex-col bg-surface font-sans">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 sm:px-10">
        <Link
          href={`/games/${game.slug}`}
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-ink/70 transition-colors hover:text-ink"
        >
          <ArrowRightIcon className="h-4 w-4 rotate-180" />
          Back to Lobby
        </Link>

        <section className="flex flex-col gap-6 rounded-3xl bg-surface-alt p-6 sm:flex-row sm:items-center sm:gap-8">
          <div className="h-40 w-full shrink-0 overflow-hidden rounded-2xl bg-card sm:w-56">
            {isImageCover(game.cover) ? (
              <Image
                src={game.cover}
                alt={`${game.name} cover art`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className={`flex h-full items-center justify-center bg-linear-to-br p-4 text-center ${game.cover.gradient}`}
              >
                <span className="text-lg font-extrabold uppercase tracking-wide text-white">
                  {game.name}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <h1 className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
              Create a Room
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-ink">{game.name}</span>
              <Badge variant="primary" className="gap-1.5">
                <UsersIcon className="h-3.5 w-3.5" />
                {game.players}
              </Badge>
              <Badge variant="outline">{game.type}</Badge>
            </div>
            <p className="max-w-xl text-muted">{game.description}</p>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
          <div className="flex flex-col gap-6 rounded-2xl bg-card p-6 shadow-sm ring-1 ring-card-foreground/5 sm:p-8">
            <h2 className="text-lg font-semibold text-card-foreground">Room Settings</h2>

            <div className="flex flex-col gap-2">
              <label htmlFor="room-name" className="text-sm font-medium text-card-foreground">
                Room Name
              </label>
              <input
                id="room-name"
                type="text"
                value={roomName}
                onChange={(event) => setRoomName(event.target.value)}
                placeholder="e.g. Friday Night Fun"
                className="h-12 w-full rounded-xl border border-card-foreground/10 bg-card px-4 text-sm text-card-foreground placeholder:text-card-muted focus:border-primary focus:outline-none"
              />
              <p className="text-xs text-card-muted">
                Choose a name that your friends will recognize.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-card-foreground">Visibility</span>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setVisibility("public")}
                  className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                    visibility === "public"
                      ? "border-primary bg-primary-tint/40 ring-1 ring-primary"
                      : "border-card-foreground/10 hover:bg-card-hover"
                  }`}
                >
                  <GlobeIcon className="h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-card-foreground">Public Room</p>
                    <p className="text-xs text-card-muted">Anyone can find and join this room.</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setVisibility("private")}
                  className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                    visibility === "private"
                      ? "border-primary bg-primary-tint/40 ring-1 ring-primary"
                      : "border-card-foreground/10 hover:bg-card-hover"
                  }`}
                >
                  <LockIcon className="h-5 w-5 shrink-0 text-card-muted" />
                  <div>
                    <p className="text-sm font-medium text-card-foreground">Private Room</p>
                    <p className="text-xs text-card-muted">
                      Only people with the link or password can join.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="room-password" className="text-sm font-medium text-card-foreground">
                Password <span className="text-card-muted">(Optional)</span>
              </label>
              <div className="relative">
                <input
                  id="room-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter a password"
                  className="h-12 w-full rounded-xl border border-card-foreground/10 bg-card px-4 pr-11 text-sm text-card-foreground placeholder:text-card-muted focus:border-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((shown) => !shown)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-card-muted hover:text-card-foreground"
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-card-muted">Only required for private rooms.</p>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-card-foreground">Max Players</span>
              <div className="relative flex h-12 items-center rounded-xl border border-card-foreground/10 bg-card pl-10 pr-9 text-sm text-card-foreground">
                <UsersIcon className="pointer-events-none absolute left-3 h-4 w-4 text-card-muted" />
                <span className="pointer-events-none">{maxPlayers} Players</span>
                <ChevronDownIcon className="pointer-events-none absolute right-3 h-4 w-4 text-card-muted" />
                <select
                  value={maxPlayers}
                  onChange={(event) => setMaxPlayers(Number(event.target.value))}
                  aria-label="Max Players"
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                >
                  {playerCounts.map((count) => (
                    <option key={count} value={count}>
                      {count} Players
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-card-muted">
                Maximum number of players allowed in this room.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-card-foreground">Additional Settings</span>
              <div className="flex flex-col divide-y divide-card-foreground/5 rounded-xl border border-card-foreground/10">
                <div className="flex items-center justify-between gap-4 p-4">
                  <div className="flex items-center gap-3">
                    <ClockIcon className="h-5 w-5 shrink-0 text-card-muted" />
                    <div>
                      <p className="text-sm font-medium text-card-foreground">
                        Auto-start when full
                      </p>
                      <p className="text-xs text-card-muted">
                        Start the game automatically when the room is full.
                      </p>
                    </div>
                  </div>
                  <Switch checked={autoStart} onChange={setAutoStart} label="Auto-start when full" />
                </div>
                <div className="flex items-center justify-between gap-4 p-4">
                  <div className="flex items-center gap-3">
                    <UserIcon className="h-5 w-5 shrink-0 text-card-muted" />
                    <div>
                      <p className="text-sm font-medium text-card-foreground">Allow spectators</p>
                      <p className="text-xs text-card-muted">
                        Others can watch the game without playing.
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={allowSpectators}
                    onChange={setAllowSpectators}
                    label="Allow spectators"
                  />
                </div>
                <div className="flex items-center justify-between gap-4 p-4">
                  <div className="flex items-center gap-3">
                    <ChatIcon className="h-5 w-5 shrink-0 text-card-muted" />
                    <div>
                      <p className="text-sm font-medium text-card-foreground">
                        Enable in-game chat
                      </p>
                      <p className="text-xs text-card-muted">Let players chat during the game.</p>
                    </div>
                  </div>
                  <Switch
                    checked={enableChat}
                    onChange={setEnableChat}
                    label="Enable in-game chat"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <Link href={`/games/${game.slug}`}>
                <Button variant="ghost" className="w-full sm:w-auto">
                  Cancel
                </Button>
              </Link>
              <Button variant="primary" className="w-full sm:w-auto" onClick={handleCreateRoom}>
                <UsersIcon className="h-4 w-4" />
                Create Room
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 rounded-2xl bg-surface-alt p-6">
              <h3 className="font-semibold text-ink">Room Preview</h3>

              <div className="overflow-hidden rounded-xl">
                <Image
                  src={homeHeroImage}
                  alt="Friends gathered around a table playing a card game"
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="text-sm text-muted">
                This is how your room will appear to other players in the lobby.
              </p>

              <div className="flex flex-col gap-4 rounded-xl bg-card p-4 shadow-sm ring-1 ring-card-foreground/5">
                <div className="flex items-center gap-3">
                  <TagIcon className="h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-xs text-card-muted">Room Name</p>
                    <p className="text-sm font-medium text-card-foreground">{previewName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <UserIcon className="h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-xs text-card-muted">Host</p>
                    <p className="text-sm font-medium text-card-foreground">You</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <UsersIcon className="h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-xs text-card-muted">Players</p>
                    <p className="text-sm font-medium text-card-foreground">1 / {maxPlayers}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <GlobeIcon className="h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-xs text-card-muted">Visibility</p>
                    <p className="text-sm font-medium text-card-foreground">
                      {visibility === "public" ? "Public" : "Private"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <LockIcon className="h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-xs text-card-muted">Password</p>
                    <p className="text-sm font-medium text-card-foreground">
                      {password ? "Set" : "None"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl bg-amber-50 p-6">
              <div className="flex items-center gap-2">
                <LightbulbIcon className="h-5 w-5 text-amber-500" />
                <h3 className="font-semibold text-ink">Tips for a great game</h3>
              </div>
              <ul className="flex flex-col gap-2">
                {TIPS.map((tip) => (
                  <li key={tip} className="flex items-start gap-2 text-sm text-muted">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <CheckIcon className="h-2.5 w-2.5" />
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <p className="flex flex-wrap items-center justify-center gap-1.5 text-center text-sm text-muted">
          <ShieldIcon className="h-4 w-4 shrink-0" />
          By creating a room, you agree to our{" "}
          <Link href="/terms" className="font-medium text-primary hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/community-guidelines" className="font-medium text-primary hover:underline">
            Community Guidelines
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
