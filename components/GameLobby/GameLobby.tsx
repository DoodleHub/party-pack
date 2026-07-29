"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { ArrowRightIcon, ChevronDownIcon, PlusIcon, SearchIcon, UsersIcon } from "@/components/ui/Icon";
import { RoomRow } from "@/components/GameLobby/RoomRow";
import { AboutGameSidebar } from "@/components/GameLobby/AboutGameSidebar";
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

interface GameLobbyProps {
  game: GameLobbyInfo;
  rooms: LobbyRoom[];
  yourRoomCode?: string;
}

export function GameLobby({ game, rooms, yourRoomCode }: GameLobbyProps) {
  const [search, setSearch] = useState("");
  const [visibility, setVisibility] = useState("all");
  const [players, setPlayers] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("recent");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

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
            <div>
              <Link href={`/games/${game.slug}/room/new`}>
                <Button variant="primary" size="lg">
                  <PlusIcon className="h-4 w-4" />
                  Create Room
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="flex h-11 w-full items-center gap-2 rounded-xl border border-ink/10 bg-card px-4 sm:w-52">
                <SearchIcon className="h-4 w-4 shrink-0 text-card-muted" />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setVisibleCount(PAGE_SIZE);
                  }}
                  placeholder="Search rooms..."
                  className="w-full bg-transparent text-sm text-card-foreground placeholder:text-card-muted focus:outline-none"
                />
              </div>
              <Select
                label="Visibility"
                value={visibility}
                options={VISIBILITY_OPTIONS}
                onChange={(value) => {
                  setVisibility(value);
                  setVisibleCount(PAGE_SIZE);
                }}
              />
              <Select
                label="Players"
                value={players}
                options={PLAYERS_OPTIONS}
                onChange={(value) => {
                  setPlayers(value);
                  setVisibleCount(PAGE_SIZE);
                }}
              />
              <Select
                label="Status"
                value={status}
                options={STATUS_OPTIONS}
                onChange={(value) => {
                  setStatus(value);
                  setVisibleCount(PAGE_SIZE);
                }}
              />
              <Select label="Sort" value={sort} options={SORT_OPTIONS} onChange={setSort} />
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
      </main>
    </div>
  );
}
