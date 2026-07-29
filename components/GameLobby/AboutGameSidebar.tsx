"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  AlertTriangleIcon,
  BookIcon,
  CheckIcon,
  ClockIcon,
  InfoIcon,
  LinkIcon,
  StarIcon,
  TrophyIcon,
  UsersIcon,
} from "@/components/ui/Icon";
import type { GameLobbyInfo } from "@/components/GameLobby/types";

function DifficultyStars({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <StarIcon
          key={i}
          filled={i < level}
          className={`h-4 w-4 ${i < level ? "text-amber-400" : "text-card-muted/40"}`}
        />
      ))}
    </div>
  );
}

export function AboutGameSidebar({ game }: { game: GameLobbyInfo }) {
  const [copied, setCopied] = useState(false);

  async function handleCopyInviteLink() {
    await navigator.clipboard.writeText(
      `${window.location.origin}/games/${game.slug}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex flex-col gap-6">
      <Card tone="surface" className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <InfoIcon className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-ink">About the Game</h3>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <UsersIcon className="h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm text-muted">Players</p>
              <p className="font-medium text-ink">{game.players}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ClockIcon className="h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm text-muted">Game Time</p>
              <p className="font-medium text-ink">{game.gameTime}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <TrophyIcon className="h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm text-muted">Type</p>
              <p className="font-medium text-ink">{game.type}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <AlertTriangleIcon className="h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm text-muted">Difficulty</p>
              <DifficultyStars level={game.difficulty} />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-ink/10 pt-6">
          <div className="flex items-center gap-2">
            <BookIcon className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-ink">How to Play</h3>
          </div>
          <ol className="flex flex-col gap-3">
            {game.howToPlay.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  {i + 1}
                </span>
                <span className="text-sm text-muted">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </Card>

      <Card tone="tint" className="flex flex-col items-center gap-3 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <UsersIcon className="h-7 w-7" />
        </span>
        <h3 className="font-semibold text-ink">Invite your friends</h3>
        <p className="text-sm text-muted">More friends, more fun.</p>
        <Button variant="outline" className="w-full" onClick={handleCopyInviteLink}>
          {copied ? (
            <>
              <CheckIcon className="h-4 w-4" />
              Copied
            </>
          ) : (
            <>
              <LinkIcon className="h-4 w-4" />
              Share Invite Link
            </>
          )}
        </Button>
      </Card>
    </div>
  );
}
