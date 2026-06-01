import { cn, statusColor, formatStatus } from "@/lib/utils";

interface BadgeProps { status: string; className?: string; }

export default function Badge({ status, className }: BadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center text-[10px] tracking-widest uppercase font-body px-2.5 py-1",
      statusColor(status), className
    )}>
      {formatStatus(status)}
    </span>
  );
}