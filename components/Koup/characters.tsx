import type { ComponentType, SVGProps } from "react";
import {
  AnchorIcon,
  CoinsIcon,
  CrownIcon,
  HandshakeIcon,
  MaskIcon,
  ShieldIcon,
  SwordIcon,
} from "@/components/ui/Icon";
import type { ActionType, Character } from "@/components/Koup/types";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export const CHARACTER_META: Record<
  Character,
  { label: string; icon: IconComponent; color: string; ring: string; bg: string }
> = {
  duke: { label: "Duke", icon: CrownIcon, color: "text-amber-400", ring: "ring-amber-400/60", bg: "bg-amber-400/15" },
  assassin: { label: "Assassin", icon: SwordIcon, color: "text-rose-400", ring: "ring-rose-400/60", bg: "bg-rose-400/15" },
  captain: { label: "Captain", icon: AnchorIcon, color: "text-sky-400", ring: "ring-sky-400/60", bg: "bg-sky-400/15" },
  ambassador: { label: "Ambassador", icon: MaskIcon, color: "text-emerald-400", ring: "ring-emerald-400/60", bg: "bg-emerald-400/15" },
  contessa: { label: "Contessa", icon: ShieldIcon, color: "text-pink-400", ring: "ring-pink-400/60", bg: "bg-pink-400/15" },
};

export interface ActionMeta {
  action: ActionType;
  label: string;
  icon: IconComponent;
  color: string;
  needsTarget: boolean;
  claim: Character | null;
  cost: number;
  description: string[];
  blockedBy: string | null;
  challengeable: boolean;
}

export const ACTION_META: Record<ActionType, ActionMeta> = {
  income: {
    action: "income",
    label: "Income",
    icon: CoinsIcon,
    color: "text-amber-300",
    needsTarget: false,
    claim: null,
    cost: 0,
    description: ["+1 Coin"],
    blockedBy: null,
    challengeable: false,
  },
  foreign_aid: {
    action: "foreign_aid",
    label: "Foreign Aid",
    icon: HandshakeIcon,
    color: "text-sky-300",
    needsTarget: false,
    claim: null,
    cost: 0,
    description: ["+2 Coins"],
    blockedBy: "Duke",
    challengeable: false,
  },
  tax: {
    action: "tax",
    label: "Tax",
    icon: CHARACTER_META.duke.icon,
    color: "text-amber-300",
    needsTarget: false,
    claim: "duke",
    cost: 0,
    description: ["Claim Duke", "+3 Coins"],
    blockedBy: null,
    challengeable: true,
  },
  steal: {
    action: "steal",
    label: "Steal",
    icon: CHARACTER_META.captain.icon,
    color: "text-sky-300",
    needsTarget: true,
    claim: "captain",
    cost: 0,
    description: ["Claim Captain", "Steal 2 Coins"],
    blockedBy: "Captain or Ambassador",
    challengeable: true,
  },
  assassinate: {
    action: "assassinate",
    label: "Assassinate",
    icon: CHARACTER_META.assassin.icon,
    color: "text-rose-300",
    needsTarget: true,
    claim: "assassin",
    cost: 3,
    description: ["Claim Assassin", "Pay 3 Coins", "Eliminate 1 Influence"],
    blockedBy: "Contessa",
    challengeable: true,
  },
  exchange: {
    action: "exchange",
    label: "Exchange",
    icon: CHARACTER_META.ambassador.icon,
    color: "text-emerald-300",
    needsTarget: false,
    claim: "ambassador",
    cost: 0,
    description: ["Claim Ambassador", "Exchange cards"],
    blockedBy: null,
    challengeable: true,
  },
  coup: {
    action: "coup",
    label: "Coup",
    icon: CrownIcon,
    color: "text-amber-300",
    needsTarget: true,
    claim: null,
    cost: 7,
    description: ["Pay 7 Coins", "Choose player", "Eliminate 1 Influence"],
    blockedBy: null,
    challengeable: false,
  },
};

export const ACTION_ORDER: ActionType[] = [
  "income",
  "foreign_aid",
  "tax",
  "steal",
  "assassinate",
  "exchange",
  "coup",
];
