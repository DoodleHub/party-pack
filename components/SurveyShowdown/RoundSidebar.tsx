interface RoundSidebarProps {
  roundNumber: number;
  totalRounds: number;
}

export function RoundSidebar({ roundNumber, totalRounds }: RoundSidebarProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/50 p-5 text-white backdrop-blur-md 2xl:p-7">
      <p className="text-lg font-extrabold tracking-wide text-primary 2xl:text-2xl">
        ROUND {roundNumber}
        <span className="block text-sm font-medium text-white/70 2xl:mt-1 2xl:text-base">of {totalRounds}</span>
      </p>
      <div className="mt-4 flex gap-2 2xl:mt-5 2xl:gap-2.5">
        {Array.from({ length: totalRounds }, (_, i) => i + 1).map((n) => (
          <span
            key={n}
            className={`h-2.5 w-2.5 rounded-full 2xl:h-3 2xl:w-3 ${
              n === roundNumber ? "bg-amber-400" : n < roundNumber ? "bg-white/80" : "bg-white/25"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
