"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Calendar, ClipboardList,
  BookOpen, DollarSign, MessageSquare, Settings,
  LogOut, Menu, X, ShieldAlert
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn, getInitials } from "@/lib/utils";

const nav = [
  { label: "Dashboard",    href: "/trainer",                  icon: LayoutDashboard },
  { label: "My Clients",   href: "/trainer/clients",          icon: Users },
  { label: "Schedule",     href: "/trainer/schedule",         icon: Calendar },
  { label: "Session Notes",href: "/trainer/notes",            icon: ClipboardList },
  { label: "Onboarding",   href: "/trainer/onboarding",       icon: BookOpen },
  { label: "Availability", href: "/trainer/availability",     icon: Calendar },
  { label: "Wallet",       href: "/trainer/wallet",           icon: DollarSign },
  { label: "Messages",     href: "/trainer/messages",         icon: MessageSquare },
  { label: "Profile",      href: "/trainer/profile",          icon: Settings },
];

interface TrainerSidebarProps {
  trainer: any;
  userEmail: string;
  unreadCount?: number;
}

export default function TrainerSidebar({ trainer, userEmail, unreadCount = 0 }: TrainerSidebarProps) {
  const pathname = usePathname();
  const router   = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const name     = trainer?.full_name ?? userEmail;
  const initials = getInitials(name);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-accent border-r border-cream/10">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-cream/10">
        <p className="font-display text-cream text-lg font-light tracking-wide">FORMED</p>
        <p className="text-[10px] tracking-widest uppercase text-muted font-body mt-0.5">
          Trainer Portal
        </p>
      </div>

      {/* Compliance warning */}
      {trainer?.compliance_flag && (
        <div className="mx-3 mt-3 bg-red-900/40 border border-red-500/30 px-3 py-2 flex items-center gap-2">
          <ShieldAlert size={13} className="text-red-400 flex-shrink-0" />
          <p className="text-[10px] text-red-300 font-body">Compliance action required</p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        {nav.map(({ label, href, icon: Icon }) => {
          const active = pathname === href ||
            (href !== "/trainer" && pathname.startsWith(href));
          const isMessages = href === "/trainer/messages";
          
          return (
            <Link key={href} href={href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-xs tracking-wide font-body transition-all duration-150 group",
                active
                  ? "bg-cream/10 text-cream"
                  : "text-muted hover:text-cream hover:bg-cream/5"
              )}
            >
              <Icon size={14} className={cn(
                "flex-shrink-0 transition-colors",
                active ? "text-cream" : "text-muted group-hover:text-cream"
              )} />
              <span>{label}</span>
              {isMessages && unreadCount > 0 && (
                <span className="ml-auto bg-warm text-ink text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-body">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Capacity indicator */}
      {trainer && (
        <div className="px-4 py-3 mx-3 mb-2 bg-cream/5 border border-cream/10">
          <div className="flex justify-between items-center mb-1.5">
            <p className="text-[10px] tracking-widest uppercase text-muted font-body">Capacity</p>
            <p className="text-[10px] text-cream/60 font-body">
              {trainer.current_client_count}/{trainer.max_active_clients}
            </p>
          </div>
          <div className="h-0.5 bg-cream/10">
            <div
              className="h-0.5 bg-warm transition-all duration-500"
              style={{
                width: `${Math.min(
                  ((trainer.current_client_count ?? 0) / (trainer.max_active_clients ?? 10)) * 100,
                  100
                )}`
              }}
            />
          </div>
        </div>
      )}

      {/* User footer */}
      <div className="px-3 py-4 border-t border-cream/10">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-warm/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {trainer?.headshot_url ? (
              <img src={trainer.headshot_url} alt={name}
                className="w-full h-full object-cover" />
            ) : (
              <span className="text-cream text-[10px] font-medium font-body">{initials}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-cream text-xs font-body truncate">{name}</p>
            <p className="text-muted text-[10px] font-body capitalize">
              {trainer?.tier?.replace(/_/g, " ") ?? "trainer"}
            </p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 text-xs text-muted hover:text-cream font-body transition-colors w-full">
          <LogOut size={13} />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden lg:flex flex-col w-56 flex-shrink-0">
        <SidebarContent />
      </div>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-ink text-cream p-2"
      >
        <Menu size={18} />
      </button>
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 flex-shrink-0"><SidebarContent /></div>
          <div className="flex-1 bg-ink/50" onClick={() => setOpen(false)}>
            <button className="absolute top-4 right-4 text-cream"><X size={20} /></button>
          </div>
        </div>
      )}
    </>
  );
}