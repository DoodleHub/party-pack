"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { AvatarStack } from "@/components/ui/AvatarStack";

const swatches = [
  { name: "Primary", token: "primary", hex: "#6C4DD3", className: "bg-primary" },
  { name: "Ink", token: "ink", hex: "#111827", className: "bg-ink" },
  { name: "Muted", token: "muted", hex: "#6B7280", className: "bg-muted" },
  { name: "Primary tint", token: "primary-tint", hex: "#EDE9FE", className: "bg-primary-tint" },
  { name: "Surface", token: "surface", hex: "#F9FAFB", className: "bg-surface" },
  { name: "Surface alt", token: "surface-alt", hex: "#F3FAF6", className: "bg-surface-alt" },
];

export default function StyleGuidePage() {
  const [sort, setSort] = useState("recent");

  return (
    <div className="flex flex-1 flex-col bg-surface font-sans">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-16 px-6 py-16 sm:px-10">
        <header className="flex flex-col gap-2">
          <Badge variant="primary">Design system</Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-ink">
            Party Pack style guide
          </h1>
          <p className="max-w-xl text-muted">
            Color tokens and base components derived from the brand palette.
          </p>
        </header>

        <section className="flex flex-col gap-6">
          <h2 className="text-lg font-semibold text-ink">Color palette</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {swatches.map((swatch) => (
              <div key={swatch.token} className="flex flex-col gap-2">
                <div
                  className={`h-20 rounded-xl border border-ink/5 ${swatch.className}`}
                />
                <div className="text-sm font-medium text-ink">{swatch.name}</div>
                <div className="text-xs text-muted">
                  {swatch.hex} &middot; bg-{swatch.token}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <h2 className="text-lg font-semibold text-ink">Typography</h2>
          <Card tone="surface" className="flex flex-col gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-ink">
              Heading / 3xl semibold
            </h1>
            <h2 className="text-xl font-semibold text-ink">Heading / xl semibold</h2>
            <p className="text-base text-ink">Body / base &mdash; text-ink</p>
            <p className="text-sm text-muted">Body / sm muted &mdash; text-muted</p>
          </Card>
        </section>

        <section className="flex flex-col gap-6">
          <h2 className="text-lg font-semibold text-ink">Buttons</h2>
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <h2 className="text-lg font-semibold text-ink">Badges</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="primary">Primary</Badge>
            <Badge variant="muted">Muted</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <h2 className="text-lg font-semibold text-ink">Cards</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card tone="surface">
              <div className="text-sm font-medium text-ink">Surface</div>
              <p className="mt-1 text-sm text-muted">Default card background.</p>
            </Card>
            <Card tone="alt">
              <div className="text-sm font-medium text-ink">Surface alt</div>
              <p className="mt-1 text-sm text-muted">Alternate section background.</p>
            </Card>
            <Card tone="tint">
              <div className="text-sm font-medium text-primary">Tint</div>
              <p className="mt-1 text-sm text-muted">Highlighted / selected state.</p>
            </Card>
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <h2 className="text-lg font-semibold text-ink">Select</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Select
              label="Sort"
              value={sort}
              onChange={setSort}
              options={[
                { value: "recent", label: "Recent" },
                { value: "players", label: "Most Players" },
                { value: "alphabetical", label: "Alphabetical" },
              ]}
            />
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <h2 className="text-lg font-semibold text-ink">Avatar stack</h2>
          <AvatarStack names={["Alex", "Jamie", "Sam", "Priya", "Chris", "Devon", "Mika"]} />
        </section>
      </main>
    </div>
  );
}
