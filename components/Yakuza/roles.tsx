import type { ComponentType, SVGProps } from "react";
import { EyeIcon, HeartIcon, MaskIcon, UserIcon } from "@/components/ui/Icon";
import type { NightStep, Role } from "@/components/Yakuza/types";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export const ROLE_META: Record<
  Role,
  {
    label: string;
    icon: IconComponent;
    color: string;
    bg: string;
    team: "mafia" | "town";
    description: string;
  }
> = {
  mafia: {
    label: "Mafia",
    icon: MaskIcon,
    color: "text-rose-600",
    bg: "bg-rose-400/15",
    team: "mafia",
    description:
      "Each night, secretly agree with your fellow Mafia on a player to eliminate. During the day, blend in and avoid suspicion.",
  },
  detective: {
    label: "Detective",
    icon: EyeIcon,
    color: "text-sky-600",
    bg: "bg-sky-400/15",
    team: "town",
    description: "Each night, investigate one player to learn whether they're Mafia.",
  },
  doctor: {
    label: "Doctor",
    icon: HeartIcon,
    color: "text-emerald-600",
    bg: "bg-emerald-400/15",
    team: "town",
    description: "Each night, choose one player to protect from the Mafia's kill.",
  },
  citizen: {
    label: "Citizen",
    icon: UserIcon,
    color: "text-amber-600",
    bg: "bg-amber-400/15",
    team: "town",
    description: "No special powers. Discuss, deduce, and vote to eliminate the Mafia.",
  },
};

// Fixed sequence the night always walks through, host-paced or timer-driven.
export const NIGHT_STEP_ORDER: NightStep[] = ["mafia", "doctor", "detective", "sleep"];

export const NIGHT_STEP_LABEL: Record<NightStep, { title: string; instruction: string }> = {
  mafia: { title: "Mafia, wake up.", instruction: "Choose one player to eliminate." },
  doctor: { title: "Doctor, wake up.", instruction: "Choose one player to protect." },
  detective: { title: "Detective, wake up.", instruction: "Choose one player to investigate." },
  sleep: { title: "Everyone, go back to sleep.", instruction: "Morning will come." },
};
