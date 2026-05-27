import { Flame } from "lucide-react";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dims = size === "lg" ? "h-12 w-12" : size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const text = size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-2xl";
  return (
    <div className="flex items-center gap-2">
      <div className={`${dims} relative flex items-center justify-center rounded-2xl bg-gradient-primary shadow-glow`}>
        <Flame className="h-1/2 w-1/2 text-primary-foreground" strokeWidth={2.5} />
      </div>
      <span className={`${text} font-bold tracking-tight text-gradient`} style={{ fontFamily: "var(--font-display)" }}>
        PULSE
      </span>
    </div>
  );
}
