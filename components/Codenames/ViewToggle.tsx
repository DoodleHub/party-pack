"use client";

import { EyeIcon, UserIcon } from "@/components/ui/Icon";

export type ViewMode = "spymaster" | "operative";

interface ViewToggleProps {
  isSpymaster: boolean;
  viewMode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewToggle({ isSpymaster, viewMode, onChange }: ViewToggleProps) {
  if (!isSpymaster) {
    return (
      <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/50 px-4 py-2 text-sm font-medium text-white/70 backdrop-blur-md">
        <UserIcon className="h-4 w-4" />
        Operative View
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/50 p-1 backdrop-blur-md">
      <button
        type="button"
        onClick={() => onChange("spymaster")}
        className={`flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
          viewMode === "spymaster" ? "bg-red-600/90 text-white" : "text-white/60 hover:text-white"
        }`}
      >
        <EyeIcon className="h-4 w-4" />
        Spymaster View
      </button>
      <button
        type="button"
        onClick={() => onChange("operative")}
        className={`flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
          viewMode === "operative" ? "bg-white/15 text-white" : "text-white/60 hover:text-white"
        }`}
      >
        <UserIcon className="h-4 w-4" />
        Operative View
      </button>
    </div>
  );
}
