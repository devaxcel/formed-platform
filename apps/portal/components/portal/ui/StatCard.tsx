import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}

export default function StatCard({ label, value, sub, accent }: StatCardProps) {
  return (
    <div className={cn(
      "p-5 border transition-all duration-150 hover:shadow-sm",
      accent
        ? "bg-ink border-ink text-cream hover:bg-accent"
        : "bg-white border-stone hover:border-warm cursor-pointer"
    )}>
      <p className={cn(
        "text-[10px] tracking-widests uppercase font-body mb-2",
        accent ? "text-cream/50" : "text-muted"
      )}>
        {label}
      </p>
      <p className={cn(
        "font-display text-3xl font-light",
        accent ? "text-cream" : "text-ink"
      )}>
        {value}
      </p>
      {sub && (
        <p className={cn(
          "text-xs font-body mt-1",
          accent ? "text-cream/40" : "text-muted"
        )}>
          {sub}
        </p>
      )}
    </div>
  );
}