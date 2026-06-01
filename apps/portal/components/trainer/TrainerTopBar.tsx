import { cn, formatStatus } from "@/lib/utils";
import { Bell } from "lucide-react";

interface TrainerTopBarProps { trainer: any; }

export default function TrainerTopBar({ trainer }: TrainerTopBarProps) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const name = trainer?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="h-14 border-b border-stone bg-cream flex items-center justify-between px-6 lg:px-8 flex-shrink-0">
      <p className="text-ink text-sm font-body hidden sm:block">
        {greeting}, <span className="font-medium">{name}</span>
      </p>
      <div className="flex items-center gap-4 ml-auto">
        {trainer?.status && (
          <span className={cn(
            "text-[10px] tracking-widest uppercase px-3 py-1 font-body",
            trainer.status === "active"
              ? "bg-green-100 text-green-700"
              : trainer.status === "restricted"
              ? "bg-red-100 text-red-700"
              : "bg-yellow-100 text-yellow-700"
          )}>
            {formatStatus(trainer.status)}
          </span>
        )}
        <button className="relative text-muted hover:text-ink transition-colors">
          <Bell size={16} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-ink rounded-full" />
        </button>
      </div>
    </div>
  );
}