import { cn } from "@/lib/utils";
import { px } from "./utils";

export const Pill = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const polyRoundness = 6;
  const hypotenuse = polyRoundness * 2;
  const hypotenuseHalf = polyRoundness / 2 - 1.5;

  return (
    <div
      style={
        {
          "--poly-roundness": px(polyRoundness),
        } as React.CSSProperties
      }
      className={cn(
        "bg-[#262626]/50 transform-gpu inline-flex h-8 items-center justify-center border border-border px-3 font-mono text-sm font-medium text-foreground/50 backdrop-blur-xs [clip-path:polygon(var(--poly-roundness)_0,calc(100%_-_var(--poly-roundness))_0,100%_var(--poly-roundness),100%_calc(100%_-_var(--poly-roundness)),calc(100%_-_var(--poly-roundness))_100%,var(--poly-roundness)_100%,0_calc(100%_-_var(--poly-roundness)),0_var(--poly-roundness))]",
        className,
      )}
    >
      <span style={{ "--h": px(hypotenuse), "--hh": px(hypotenuseHalf) } as React.CSSProperties} className="absolute top-[var(--hh)] left-[var(--hh)] inline-block h-[2px] w-[var(--h)] origin-top -translate-x-1/2 -rotate-45 bg-border" />
      <span style={{ "--h": px(hypotenuse), "--hh": px(hypotenuseHalf) } as React.CSSProperties} className="absolute top-[var(--hh)] right-[var(--hh)] h-[2px] w-[var(--h)] translate-x-1/2 rotate-45 bg-border" />
      <span style={{ "--h": px(hypotenuse), "--hh": px(hypotenuseHalf) } as React.CSSProperties} className="absolute bottom-[var(--hh)] left-[var(--hh)] h-[2px] w-[var(--h)] -translate-x-1/2 rotate-45 bg-border" />
      <span style={{ "--h": px(hypotenuse), "--hh": px(hypotenuseHalf) } as React.CSSProperties} className="absolute right-[var(--hh)] bottom-[var(--hh)] h-[2px] w-[var(--h)] translate-x-1/2 -rotate-45 bg-border" />

      <span className="mr-2 inline-block size-2.5 rounded-full bg-primary shadow-glow shadow-primary/50" />

      {children}
    </div>
  );
};
