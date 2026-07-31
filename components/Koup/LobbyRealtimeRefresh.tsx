"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { subscribeToLobbyRooms } from "@/components/Koup/data";

// Rooms are fetched server-side, so newly created (or updated/ended) rooms
// wouldn't otherwise show up for other players already sitting on the lobby
// page until they navigated or reloaded.
export function LobbyRealtimeRefresh() {
  const router = useRouter();

  useEffect(() => {
    return subscribeToLobbyRooms(() => router.refresh());
  }, [router]);

  return null;
}
