"use client";

import { Bell } from "lucide-react";
import { cn, formatStatus } from "@/lib/utils";

interface TopBarProps { profile: any; }

export default function TopBar({ profile }: TopBarProps) {
  const now  = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const name = profile?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="h-14 border-b border-stone bg-cream flex items-center justify-between px-6 lg:px-8 flex-shrink-0">
      <div className="hidden sm:block">
        <p className="text-ink text-sm font-body">
          {greeting}, <span className="font-medium">{name}</span>
        </p>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        {/* Status badge */}
        {profile?.status && (
          <span className={cn(
            "text-[10px] tracking-widest uppercase px-3 py-1 font-body",
            profile.status === "active"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          )}>
            {formatStatus(profile.status)}
          </span>
        )}

        {/* Notifications */}
        <button className="relative text-muted hover:text-ink transition-colors">
          <Bell size={16} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-ink rounded-full" />
        </button>
      </div>
    </div>
  );
}