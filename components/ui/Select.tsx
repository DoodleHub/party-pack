"use client";

import { ChevronDownIcon } from "@/components/ui/Icon";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  className?: string;
}

export function Select({ label, value, options, onChange, className = "" }: SelectProps) {
  const selected = options.find((option) => option.value === value) ?? options[0];

  return (
    <div
      className={`relative inline-flex h-11 items-center overflow-hidden rounded-xl border border-ink/10 bg-card pl-3 pr-7 text-sm text-card-foreground ${className}`}
    >
      <span className="pointer-events-none truncate">
        <span className="text-card-muted">{label}: </span>
        <span className="font-medium">{selected?.label}</span>
      </span>
      <ChevronDownIcon className="pointer-events-none absolute right-2 h-4 w-4 text-card-muted" />
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
