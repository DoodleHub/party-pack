"use client";

import { CloseIcon, MaskIcon } from "@/components/ui/Icon";
import { ROLE_META } from "@/components/Yakuza/roles";
import type { Role } from "@/components/Yakuza/types";

interface RoleRevealModalProps {
  role: Role;
  teammateNames: string[];
  onClose: () => void;
}

export function RoleRevealModal({ role, teammateNames, onClose }: RoleRevealModalProps) {
  const meta = ROLE_META[role];
  const Icon = meta.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm rounded-2xl border border-panel-foreground/10 bg-panel p-8 text-center text-panel-foreground shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 cursor-pointer rounded-full p-1 text-panel-muted hover:bg-panel-hover hover:text-panel-foreground"
        >
          <CloseIcon className="h-5 w-5" />
        </button>

        <p className="text-xs font-semibold tracking-wide text-panel-muted uppercase">Your role is</p>
        <div className={`mx-auto mt-4 flex h-16 w-16 items-center justify-center rounded-full ${meta.bg}`}>
          <Icon className={`h-8 w-8 ${meta.color}`} />
        </div>
        <h2 className={`mt-3 text-2xl font-extrabold ${meta.color}`}>{meta.label}</h2>
        <p className="mt-2 text-sm text-panel-muted">{meta.description}</p>

        {teammateNames.length > 0 && (
          <div className="mt-4 rounded-xl border border-rose-400/30 bg-rose-400/10 p-3">
            <p className="flex items-center justify-center gap-1.5 text-xs font-semibold text-rose-500">
              <MaskIcon className="h-3.5 w-3.5" />
              Your fellow Mafia
            </p>
            <p className="mt-1 text-sm font-medium text-panel-foreground">{teammateNames.join(", ")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
