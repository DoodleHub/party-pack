interface RoundSidebarProps {
  roundNumber: number;
  totalRounds: number;
}

export function RoundSidebar({ roundNumber, totalRounds }: RoundSidebarProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/50 p-5 text-white backdrop-blur-md">
      <p className="text-lg font-extrabold tracking-wide text-primary">
        ROUND {roundNumber}
        <span className="block text-sm font-medium text-white/70">of {totalRounds}</span>
      </p>
      <div className="mt-4 flex gap-2">
        {Array.from({ length: totalRounds }, (_, i) => i + 1).map((n) => (
          <span
            key={n}
            className={`h-2.5 w-2.5 rounded-full ${
              n === roundNumber ? "bg-amber-400" : n < roundNumber ? "bg-white/80" : "bg-white/25"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
