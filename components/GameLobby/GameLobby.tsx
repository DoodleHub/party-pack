"use client";

import { Suspense, useMemo, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { ArrowRightIcon, ChevronDownIcon, PlusIcon, SearchIcon, UsersIcon } from "@/components/ui/Icon";
import { RoomRow } from "@/components/GameLobby/RoomRow";
import { AboutGameSidebar } from "@/components/GameLobby/AboutGameSidebar";
import { RoomBrowserSkeleton } from "@/components/GameLobby/LobbySkeleton";
import type { GameLobbyInfo, LobbyRoom } from "@/components/GameLobby/types";
import type { GameCover } from "@/lib/games";

const PAGE_SIZE = 4;

function isImageCover(cover: GameCover): cover is Exclude<GameCover, { gradient: string }> {
  return !("gradient" in cover);
}

const VISIBILITY_OPTIONS = [
  { value: "all", label: "All" },
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
];

const PLAYERS_OPTIONS = [
  { value: "all", label: "Any" },
  { value: "small", label: "4 or fewer" },
  { value: "large", label: "5 or more" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "waiting", label: "Waiting" },
  { value: "starting-soon", label: "Starting Soon" },
  { value: "in-progress", label: "In Progress" },
  { value: "full", label: "Full" },
];

const SORT_OPTIONS = [
  { value: "recent", label: "Recent" },
  { value: "players", label: "Most Players" },
  { value: "alphabetical", label: "Alphabetical" },
];

const DEFAULT_FILTERS = {
  q: "",
  visibility: "all",
  players: "all",
  status: "all",
  sort: "recent",
} as const;

interface GameLobbyProps {
  game: GameLobbyInfo;
  rooms: LobbyRoom[];
  yourRoomCode?: string;
}

export function GameLobby({ game, rooms, yourRoomCode }: GameLobbyProps) {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");

  function handleJoinByCode(event: FormEvent) {
    event.preventDefault();
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    router.push(`/games/${game.slug}/room/${code}`);
  }

  return (
    <div className="flex flex-1 flex-col bg-surface font-sans">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 sm:px-10">
        <Link
          href="/games"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-ink/70 transition-colors hover:text-ink"
        >
          <ArrowRightIcon className="h-4 w-4 rotate-180" />
          Back to Games
        </Link>

        <section className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="overflow-hidden rounded-3xl bg-surface-alt">
            {isImageCover(game.cover) ? (
              <Image
                src={game.cover}
                alt={`${game.name} cover art`}
                className="h-full w-full object-cover"
                sizes="(min-width: 1024px) 50vw, 100vw"
                priority
              />
            ) : (
              <div
                className={`flex aspect-16/10 items-center justify-center bg-linear-to-br p-6 text-center ${game.cover.gradient}`}
              >
                <span className="text-3xl font-extrabold uppercase tracking-wide text-white drop-shadow-md">
                  {game.name}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-5">
            <h1 className="text-5xl font-extrabold tracking-tight text-ink sm:text-6xl">
              {game.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="primary" className="gap-1.5">
                <UsersIcon className="h-3.5 w-3.5" />
                {game.players}
              </Badge>
              <Badge variant="outline">{game.type}</Badge>
            </div>
            <p className="max-w-md text-lg text-muted">{game.description}</p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href={`/games/${game.slug}/room/new`}>
                <Button variant="primary" size="lg">
                  <PlusIcon className="h-4 w-4" />
                  Create Room
                </Button>
              </Link>
              <form onSubmit={handleJoinByCode} className="flex items-center gap-2">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(event) => setJoinCode(event.target.value)}
                  placeholder="Have a code?"
                  maxLength={8}
                  className="h-11 w-36 rounded-xl border border-ink/10 bg-card px-4 text-sm uppercase tracking-widest text-card-foreground placeholder:normal-case placeholder:tracking-normal placeholder:text-card-muted focus:outline-none"
                />
                <Button type="submit" variant="outline" size="lg" disabled={!joinCode.trim()}>
                  Join
                  <ArrowRightIcon className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </section>

        <Suspense fallback={<RoomBrowserSkeleton />}>
          <RoomBrowser game={game} rooms={rooms} yourRoomCode={yourRoomCode} />
        </Suspense>
      </main>
    </div>
  );
}

function RoomBrowser({ game, rooms, yourRoomCode }: GameLobbyProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Filters live in the URL (rather than local state) so they survive
  // navigating into a room and back via the browser's back button.
  const search = searchParams.get("q") ?? DEFAULT_FILTERS.q;
  const visibility = searchParams.get("visibility") ?? DEFAULT_FILTERS.visibility;
  const players = searchParams.get("players") ?? DEFAULT_FILTERS.players;
  const status = searchParams.get("status") ?? DEFAULT_FILTERS.status;
  const sort = searchParams.get("sort") ?? DEFAULT_FILTERS.sort;

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  function setFilter(key: keyof typeof DEFAULT_FILTERS, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === DEFAULT_FILTERS[key]) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    const query = params.toString();
    window.history.replaceState(null, "", query ? `${pathname}?${query}` : pathname);
    setVisibleCount(PAGE_SIZE);
  }

  const filteredRooms = useMemo(() => {
    let result = rooms.filter((room) => {
      if (search && !room.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (visibility !== "all" && room.visibility !== visibility) return false;
      if (status !== "all" && room.status !== status) return false;
      if (players === "small" && room.maxPlayers > 4) return false;
      if (players === "large" && room.maxPlayers <= 4) return false;
      return true;
    });

    result = [...result].sort((a, b) => {
      if (sort === "players") return b.playerNames.length - a.playerNames.length;
      if (sort === "alphabetical") return a.name.localeCompare(b.name);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [rooms, search, visibility, status, players, sort]);

  const visibleRooms = filteredRooms.slice(0, visibleCount);
  const hasMore = visibleCount < filteredRooms.length;

  return (
    <section className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex h-11 w-full items-center gap-2 rounded-xl border border-ink/10 bg-card px-4 sm:w-52">
            <SearchIcon className="h-4 w-4 shrink-0 text-card-muted" />
            <input
              type="text"
              value={search}
              onChange={(event) => setFilter("q", event.target.value)}
              placeholder="Search rooms..."
              className="w-full bg-transparent text-sm text-card-foreground placeholder:text-card-muted focus:outline-none"
            />
          </div>
          <Select
            label="Visibility"
            value={visibility}
            options={VISIBILITY_OPTIONS}
            onChange={(value) => setFilter("visibility", value)}
          />
          <Select
            label="Players"
            value={players}
            options={PLAYERS_OPTIONS}
            onChange={(value) => setFilter("players", value)}
          />
          <Select
            label="Status"
            value={status}
            options={STATUS_OPTIONS}
            onChange={(value) => setFilter("status", value)}
          />
          <Select
            label="Sort"
            value={sort}
            options={SORT_OPTIONS}
            onChange={(value) => setFilter("sort", value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <UsersIcon className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-ink">Active Rooms</h2>
          <Badge variant="primary">{filteredRooms.length}</Badge>
        </div>

        {visibleRooms.length > 0 ? (
          <div className="flex flex-col gap-4">
            {visibleRooms.map((room) => (
              <RoomRow
                key={room.code}
                gameSlug={game.slug}
                room={room}
                isYourRoom={room.code === yourRoomCode}
              />
            ))}
          </div>
        ) : (
          <p className="py-16 text-center text-muted">
            No rooms match your filters. Try adjusting your search.
          </p>
        )}

        {hasMore && (
          <Button
            variant="outline"
            className="mx-auto"
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
          >
            Load More Rooms
            <ChevronDownIcon className="h-4 w-4" />
          </Button>
        )}
      </div>

      <AboutGameSidebar game={game} />
    </section>
  );
}
