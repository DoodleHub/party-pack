"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ChatIcon, CloseIcon } from "@/components/ui/Icon";
import { ChatPanel } from "@/components/Koup/ChatPanel";

interface ChatModalProps {
  roomId: string;
  senderId: string;
}

export function ChatModal({ roomId, senderId }: ChatModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="panel" onClick={() => setOpen(true)}>
        <ChatIcon className="h-4 w-4" />
        Chat
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex h-[70vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-panel-foreground/10 bg-panel p-6 text-panel-foreground shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3">
              <h2 className="text-lg font-bold">Chat</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="cursor-pointer rounded-full p-1 text-panel-muted hover:bg-panel-hover hover:text-panel-foreground"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1">
              <ChatPanel roomId={roomId} senderId={senderId} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
